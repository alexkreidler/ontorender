// OntoRender v2

// Loads entire dataset in memory, uses clownface graph manipulation to select subsets, outputs to file

import clownface from "clownface"
import { rdf, rdfs, schema } from "@tpluscode/rdf-ns-builders"

import parser from "rdf-parse"
import { createReadStream } from "fs"

import { once } from "events"
import { computeName } from "./utils"
import { serialize_all } from "./serializers"
import { DatasetCore, Stream, Quad, Term, NamedNode } from "rdf-js"
import dataFactory from "@graphy/memory.dataset.fast"
import { GraphyMemoryDataset } from "@graphy/memory.dataset.fast"
import merge from "merge-stream"
import R from "ramda"

import RDF from "@rdfjs/namespace"

// Weird import workaround for ts-node
import { promises as fsPromises } from "fs"
const { mkdir, readdir, stat } = fsPromises

// import pLimit from "p-limit"

// const limit = pLimit(3)

interface Item {
    readonly name: string
    readonly node: NamedNode<string>
    readonly dataset: DatasetCore
    readonly pointer: clownface.AnyPointer
}

const handlePointer = (p: clownface.AnyPointer): Item => {
    if (p._context.length !== 1) {
        throw new Error(
            `Context can only have one node, has ${p._context.length} instead`
        )
    }
    const cx = p._context[0]
    const iri = cx.term
    if (!iri) {
        throw new Error(`Invalid property pointer: ${JSON.stringify(p)}`)
    }
    if (iri.termType !== "NamedNode") {
        throw new Error(`Wrong termType: ${iri.termType}`)
    }
    const name = computeName(iri.value)
    return { name, node: iri, dataset: cx.dataset, pointer: p }
}

const createMarkdown = (item: Item): string => {
    const isProperty =
        item.pointer.has(rdf.type, rdf.Property).values.length >= 1
    const isClass = item.pointer.has(rdf.type, rdfs.Class).values.length >= 1
    if (isProperty && isClass) {
        console.warn(
            `Item: ${item.name} has rdf:type of both Property and Class`
        )
    }
    const description = item.pointer.out(rdfs.comment).value

    interface Detail {
        name: string
        predicate: NamedNode | NamedNode[]
    }
    const dt = (pointer: clownface.AnyPointer, inp: Detail): string => {
        const out = pointer.out(inp.predicate).values
        return out.length > 0 ? `${inp.name}: ${out.join(", ")}\n\n` : ""
    }
    const detail = R.curry(dt)

    const propertyDetails = (pointer: clownface.AnyPointer): string => {
        if (pointer.has(rdf.type, rdf.Property).values.length == 0) {
            return ""
        }
        const schemaHttps = RDF("https://schema.org/")
        const pd: Detail[] = [
            { name: "Subproperty of", predicate: rdfs.subPropertyOf },
            { name: "Domain", predicate: rdfs.domain },
            {
                name: "Domain Includes",
                predicate: [schema.domainIncludes, schemaHttps.domainIncludes],
            },
            { name: "Range", predicate: rdfs.range },
            {
                name: "Range Includes",
                predicate: [schema.rangeIncludes, schemaHttps.rangeIncludes],
            },
        ]
        const cd = detail(pointer)
        const details = pd.map(cd).join("")
        return details
            ? `## Details
${details}`
            : ""
    }

    const classDetails = (pointer: clownface.AnyPointer): string => {
        if (pointer.has(rdf.type, rdfs.Class).values.length == 0) {
            return ""
        }
        const schemaHttps = RDF("https://schema.org/")
        const pd: Detail[] = [
            { name: "Subclass of", predicate: rdfs.subClassOf },
        ]
        const cd = detail(pointer)
        const details = pd.map(cd).join("")

        const properties = item.pointer
            .in([schema.domainIncludes, rdfs.domain])
            .map(
                (q) => `### ${computeName(q.value)}

IRI: [${q.value}](${q.value})`
            )

        return `${
            details
                ? `## Details
${details}`
                : ""
        }${
            properties.length > 0
                ? `## Properties

${properties.join("\n\n")}`
                : ""
        }`
    }

    const markdown = `# ${item.name}

IRI: [${item.node.value}](${item.node.value})

Type(s): ${item.pointer
        .out(rdf.type)
        .values.map((v) => `[${v}](${v})`)
        .join(", ")}

${description}

${isProperty ? propertyDetails(item.pointer) : ""}${
        isClass ? classDetails(item.pointer) : ""
    }`

    return markdown
}

async function renderProperty(
    item: Item,
    output: string,
    force?: boolean,
    markdown?: boolean
) {
    console.log("Rendering property", item.name)
    const data = item.dataset.match(item.node)

    // we can do the following b/c we know its graphy
    await serialize_all(
        output,
        item.name,
        data as DatasetCore & Stream<Quad>,
        force,
        markdown ? createMarkdown(item) : undefined
    )
}

async function renderClass(
    item: Item,
    output: string,
    force?: boolean,
    markdown?: boolean
) {
    console.log("Rendering class", item.name)
    const data = item.dataset.match(item.node)

    const propertyData = item.pointer
        .in([schema.domainIncludes, rdfs.domain])
        .map((q) => {
            const propertyDs = item.dataset.match(q.term)

            return propertyDs as GraphyMemoryDataset
        })

    //@ts-ignore
    const fstream = merge(data as GraphyMemoryDataset, ...propertyData)
    await serialize_all(
        output,
        item.name,
        //@ts-ignore
        fstream as Stream<Quad>,
        force,
        markdown ? createMarkdown(item) : undefined
    )
}

const checkMakeDirectory = async (directory: string) => {
    try {
        const st = await stat(directory)

        if (!st.isDirectory) {
            throw new Error("Input is not directory")
        }
        if (st.size !== 0) {
            const o = await readdir(directory)
            if (o.length !== 0) {
                console.warn(
                    `Warning: provided directory is not empty: ${directory}`
                )
            }
        }
    } catch (error) {
        if (error.code == "ENOENT") {
            await mkdir(directory, { recursive: true })
        } else {
            throw error
        }
    }
}

export async function render(
    input: string,
    output: string,
    force: boolean,
    markdown: boolean
) {
    console.log("Checking output directory")
    await checkMakeDirectory(output)

    console.log("Loading from input file", input)

    const textStream = createReadStream(input)

    const stream = parser.parse(textStream, { path: input })

    const dataset = dataFactory()

    stream.pipe(dataset)

    await once(dataset, "finish")

    console.log("Completed loading")

    console.log("Starting properties")

    const properties = clownface({ dataset }).has(rdf.type, rdf.Property)

    const workersProperties = properties.map((q) =>
        renderProperty(handlePointer(q), output, force, markdown)
    )
    await Promise.all(workersProperties)

    console.log("Properties done")

    console.log("Starting classes")

    const classes = clownface({ dataset }).has(rdf.type, rdfs.Class)

    const workersClasses = classes.map((q) =>
        renderClass(handlePointer(q), output, force, markdown)
    )
    await Promise.all(workersClasses)
    console.log("Classes done")
}
