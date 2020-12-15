import rdfParser from "rdf-parse"
export function foo(): string {
    return "hi"
}

import { createReadStream } from "fs"

import { storeStream } from "rdf-store-stream"
import { DataFactory } from "rdf-data-factory"
import { Store, Stream } from "rdf-js"

import mergeStream from "merge-stream"
// import rdfSerializer from "rdf-serialize"

// import stringifyStream from "stream-to-string"
import {
    renderClass,
    renderClasses,
    renderProperties,
    renderProperty,
} from "./sparql"
import { turtle } from "./serializers"

export async function waitStream(stream: Stream, log?: boolean) {
    return new Promise((resolve, reject) => {
        stream
            .on("data", (quad) => {
                log ? console.log(quad) : null
            })
            .on("error", (error) => {
                console.error(error)
                reject(error)
            })
            .on("end", () => {
                console.log("All done!")
                resolve("done")
            })
    })
}
const dataFactory = new DataFactory()
export function createClassStream(
    iri: string,
    store: Store
): NodeJS.ReadableStream {
    const thisNode = dataFactory.namedNode(iri)
    const classDataStream = store.match(thisNode)

    const classProperties = store.match(
        undefined,
        dataFactory.namedNode("http://schema.org/domainIncludes"),
        thisNode
    )
    const classLinks = store.match(
        undefined,
        dataFactory.namedNode("http://schema.org/rangeIncludes"),
        thisNode
    )

    // prettier-ignore
    /**  @ts-ignore */
    const outStream = mergeStream(classDataStream, classProperties, classLinks)

    return outStream
}

export function createPropertyStream(iri: string, store: Store): Stream {
    const thisNode = dataFactory.namedNode(iri)
    return store.match(thisNode)
}

export async function generate(filename: string) {
    const dataStream = rdfParser.parse(createReadStream(filename), {
        path: filename,
    })

    // dataStream

    const store: Store = await storeStream(dataStream)

    const resultStream = createClassStream("http://schema.org/Person", store)

    const quadStream = (resultStream as unknown) as Stream

    // await waitStream(quadStream, true)

    const _out = turtle(quadStream)
}

console.log("start")
// renderClasses("/home/alex/c2/schemaorg/data/schema.ttl").then(() => {
//     console.log("promise 1 end")
// })
renderProperties("/home/alex/c2/schemaorg/data/schema.ttl").then(() => {
    console.log("promise 2 end")
})
// renderClass("schema:Person", "/home/alex/c2/schemaorg/data/schema.ttl").then(
//     () => {
//         console.log("promise end")
//     }
// )
console.log("done")
