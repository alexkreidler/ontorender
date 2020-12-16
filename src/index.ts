// OntoRender v2

// Loads entire dataset in memory, uses clownface graph manipulation to select subsets, outputs to file

import clownface from "clownface"
import { rdf, rdfs, schema } from "@tpluscode/rdf-ns-builders"

import parser from "rdf-parse"
import { createReadStream } from "fs"

import dataFactory from "@graphy/memory.dataset.fast"
import { once } from "events"
import { computeName } from "./utils"
import { serialize_all } from "./serializers"
import { DatasetCore, Stream, Quad, Term, NamedNode } from "rdf-js"
import { GraphyMemoryDataset } from "@graphy/memory.dataset.fast"
import merge from "merge-stream"

// import pLimit from "p-limit"

// const limit = pLimit(3)

const input = "/home/alex/c2/schemaorg/data/schema.ttl"
const output = "/home/alex/c2/ontorender/work2"

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

async function renderProperty(item: Item) {
    console.log("Rendering property", item.name)
    const data = item.dataset.match(item.node)
    // we can do the following b/c we know its graphy
    await serialize_all(output, item.name, data as DatasetCore & Stream<Quad>)
}

async function renderClass(item: Item) {
    console.log("Rendering class", item.name)

    const data = item.dataset.match(item.node)

    const propertyData = item.pointer.in(schema.domainIncludes).map((q) => {
        const propertyDs = item.dataset.match(q.term)

        return propertyDs as GraphyMemoryDataset
    })

    //@ts-ignore
    const fstream = merge(data as GraphyMemoryDataset, ...propertyData)
    //@ts-ignore
    await serialize_all(output, item.name, fstream as Stream<Quad>)
}

async function work(input: string, _output: string) {
    console.log("Loading from input file", input)

    const textStream = createReadStream(input)

    const stream = parser.parse(textStream, { path: input })

    const dataset = dataFactory()

    stream.pipe(dataset)

    await once(dataset, "finish")

    console.log("Completed loading")

    console.log("Starting properties")

    const properties = clownface({ dataset }).has(rdf.type, rdf.Property)

    const workers = properties.map((q) => renderProperty(handlePointer(q)))
    await Promise.all(workers)

    console.log("Properties done")

    console.log("Starting classes")

    const classes = clownface({ dataset }).has(rdf.type, rdfs.Class)

    const w2 = classes.map((q) => renderClass(handlePointer(q)))
    await Promise.all(w2)
    console.log("Classes done")
}

console.log("Starting")

work(input, output).then(() => {
    console.log("Done")
})
