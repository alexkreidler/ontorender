// import { waitStream } from "./index"
import { newEngine } from "@comunica/actor-init-sparql-file"
import { LoggerPretty } from "@comunica/logger-pretty"
import { Stream } from "rdf-js"
import { turtle } from "./serializers"

export function prettyPrint(data: any): string {
    return JSON.stringify(data, undefined, 4)
}

// For some reason, comunica doesn't work well in Jest tests using
// ts-node
export async function select() {
    const myEngine = newEngine()
    //
    // ?s ?p <http://dbpedia.org/resource/Belgium>.
    const result = await myEngine.query(
        `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX schema: <http://schema.org/>
        
        CONSTRUCT {
            schema:Person ?p ?o .
            ?prop ?p2 ?o2 .
        } WHERE {
            schema:Person rdf:type rdfs:Class ;
                ?p ?o .
            ?prop schema:domainIncludes schema:Person ;
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
        console.log("quads")
        console.log(result)

        if (result.metadata) {
            console.log(await result.metadata())
        }

        console.log(prettyPrint(result.metadata))

        const _out = turtle(result.quadStream as Stream)
    }
}
