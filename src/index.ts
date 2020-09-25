import rdfParser from "rdf-parse"
export function foo(): string {
    return "hi"
}

import { createReadStream } from "fs"

import { storeStream } from "rdf-store-stream"
import { DataFactory } from "rdf-data-factory"
import { Store, Stream } from "rdf-js"

import mergeStream from "merge-stream"
import rdfSerializer from "rdf-serialize"

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

    const v = dataFactory.variable("prop")
    const classProperties = store.match(
        v,
        dataFactory.namedNode("http://schema.org/domainIncludes"),
        thisNode
    )
    const classPropertiesData = store.match(v)
    // const classLinks = store.match(
    //     undefined,
    //     dataFactory.namedNode("http://schema.org/rangeIncludes"),
    //     thisNode
    // )

    // prettier-ignore
    /**  @ts-ignore */
    const outStream = mergeStream(classDataStream,
        classProperties,
        classPropertiesData
    )

    // classDataStream.pipe(outStream);
    // /** @ts-ignore */
    // classProperties.pipe(outStream);
    // /** @ts-ignore */
    // classLinks.pipe(outStream);
    return outStream
}

export function createPropertyStream(iri: string, store: Store): Stream {
    const thisNode = dataFactory.namedNode(iri)
    return store.match(thisNode)
}

import stringifyStream from "stream-to-string"

export async function generate(filename: string) {
    const dataStream = rdfParser.parse(createReadStream(filename), {
        path: filename,
    })

    // dataStream

    const store: Store = await storeStream(dataStream)

    const resultStream = createClassStream("http://schema.org/Person", store)

    const quadStream = (resultStream as unknown) as Stream

    // await waitStream(quadStream, true)

    const textStream = rdfSerializer.serialize(quadStream, {
        contentType: "text/turtle",
        // path: "http://example.org/myfile.ttl",
    })
    const out = await stringifyStream(textStream)
    console.log(out)
}
