// import { waitStream } from "./index"
import { newEngine } from "@comunica/actor-init-sparql-file"
import { LoggerPretty } from "@comunica/logger-pretty"
import { Dataset, Quad, Stream } from "rdf-js"
import { nquads, serialize_all, turtle } from "./serializers"
// import rdfStoreStream from "rdf-store-stream"

export function prettyPrint(data: any): string {
    return JSON.stringify(data, undefined, 4)
}
// import * as canonize from "rdf-canonize"

// import streamifyArray from "streamify-array"
// import graphy from "graphy"
import dataset from "@graphy/memory.dataset.fast"
import { GraphyMemoryDataset } from "extra-types"
// For some reason, comunica doesn't work well in Jest tests using
// ts-node
export async function select() {
    const myEngine = newEngine()
    //
    // ?s ?p <http://dbpedia.org/resource/Belgium>.
    const cName = "schema:Person"
    const result = await myEngine.query(
        `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX schema: <http://schema.org/>
        
        CONSTRUCT {
            ${cName} ?p ?o .
            ?prop ?p2 ?o2 .
        } WHERE {
            ${cName} rdf:type rdfs:Class ;
                ?p ?o .
            ?prop schema:domainIncludes ${cName} ;
                ?p2 ?o2 .
        }`,
        {
            sources: [
                {
                    type: "file",
                    // value: "file:///home/alex/c2/sb2/src/schemas/hydra.jsonld",
                    value: "/home/alex/c2/schemaorg/data/schema.ttl",
                },
            ],
            baseIRI: "http://schema.org",

            log: new LoggerPretty({ level: "trace" }),
        }
    )

    if (!("quads" in result)) {
        throw new Error("No quads, improper response")
    } else {
        console.log("Has quads")

        // const store = await rdfStoreStream.storeStream(result.quadStream as Stream)

        const ds: GraphyMemoryDataset = dataset()
        ds.addAll((await result.quads()) as Quad[])
        // console.log(ds.toCanonical())

        const norm = ds.canonicalize()
        // // const norm = await canonize.canonize(await result.quads(), {
        // //     algorithm: "URDNA2015",
        // //     format: "text/turtle",
        // // })
        // console.log(norm.match())

        // // const qs = streamifyArray(norm.toArray())

        serialize_all("/home/alex/c2/ontorender/work", "out", norm)

        // const _out = await turtle(norm.match())
        // console.log("turtle done")

        // const _o2 = await nquads(norm)
    }
}
