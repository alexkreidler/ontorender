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

async function renderProperty(item: Item, output: string, force: boolean) {
    console.log("Rendering property", item.name)
    const data = item.dataset.match(item.node)
    // we can do the following b/c we know its graphy
    await serialize_all(
        output,
        item.name,
        data as DatasetCore & Stream<Quad>,
        force
    )
}

async function renderClass(item: Item, output: string, force: boolean) {
    console.log("Rendering class", item.name)

    const data = item.dataset.match(item.node)

    const propertyData = item.pointer.in(schema.domainIncludes).map((q) => {
        const propertyDs = item.dataset.match(q.term)

        return propertyDs as GraphyMemoryDataset
    })

    //@ts-ignore
    const fstream = merge(data as GraphyMemoryDataset, ...propertyData)
    //@ts-ignore
    await serialize_all(output, item.name, fstream as Stream<Quad>, force)
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

export async function render(input: string, output: string, force: boolean) {
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
        renderProperty(handlePointer(q), output, force)
    )
    await Promise.all(workersProperties)

    console.log("Properties done")

    console.log("Starting classes")

    const classes = clownface({ dataset }).has(rdf.type, rdfs.Class)

    const workersClasses = classes.map((q) =>
        renderClass(handlePointer(q), output, force)
    )
    await Promise.all(workersClasses)
    console.log("Classes done")
}
