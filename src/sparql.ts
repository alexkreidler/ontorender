// import { waitStream } from "./index"
import { newEngine } from "@comunica/actor-init-sparql-file"
import { LoggerPretty } from "@comunica/logger-pretty"
import { Dataset, NamedNode, Quad, Stream } from "rdf-js"
import { nquads, serialize_all, turtle } from "./serializers"
import { Bindings } from "@comunica/bus-query-operation"
// import rdfStoreStream from "rdf-store-stream"

export function prettyPrint(data: any): string {
    return JSON.stringify(data, undefined, 4)
}
// import * as canonize from "rdf-canonize"

// import streamifyArray from "streamify-array"
// import graphy from "graphy"
import dataset from "@graphy/memory.dataset.fast"
import { GraphyMemoryDataset } from "extra-types"

const myEngine = newEngine()

// For some reason, comunica doesn't work well in Jest tests using
// ts-node
/** Renders a single `rdfs:Class`.
 * Outputs all the triples from that class, along with all triples
 * for properties whose `schema:domainIncludes` that class
 */
export async function renderClass(
    classIRI: string,
    className: string,
    ontoFile: string
) {
    const result = await myEngine.query(
        `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX schema: <http://schema.org/>
        
        CONSTRUCT {
            <${classIRI}> ?p ?o .
            ?prop ?p2 ?o2 .
        } WHERE {
            <${classIRI}> rdf:type rdfs:Class ;
                ?p ?o .
            ?prop schema:domainIncludes <${classIRI}> ;
                ?p2 ?o2 .
        }`,
        {
            sources: [
                {
                    type: "file",
                    value: ontoFile,
                },
            ],
        }
    )

    if (!("quads" in result)) {
        throw new Error("No quads, improper response")
    } else {
        console.log("Has quads")

        const ds: GraphyMemoryDataset = dataset()
        // ds.import(result.quadStream as Stream<Quad>)
        ds.addAll((await result.quads()) as Quad[])

        const norm = ds.canonicalize()

        serialize_all("/home/alex/c2/ontorender/work", className, norm)
    }
}
function basename(str: string, sep: string) {
    return str.substr(str.lastIndexOf(sep) + 1)
}

/**
 * Renders all `rdfs:Class`es in a given file
 * @param ontoFile - the file of the ontology from which to render all classes
 */
export async function renderClasses(ontoFile: string) {
    const result = await myEngine.query(
        `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX schema: <http://schema.org/>
        
        SELECT ?s WHERE {
            ?s rdf:type rdfs:Class .
        }`,
        {
            sources: [
                {
                    type: "file",
                    value: ontoFile,
                },
            ],
        }
    )
    if (result.type == "bindings") {
        const b = await result.bindings()

        // let obj = Object.fromEntries(b.entries())
        const workers = []
        for (let bind of b) {
            const a = (bind as unknown) as Map<string, NamedNode>

            const t = a.get("?s")!
            const iri = t.value
            console.log(`Starting to process IRI: ${iri}`)

            // For schema.org, only getting the last path in the URL works as the name
            const className = basename(iri, "/")
            const worker = renderClass(iri, className, ontoFile)
            workers.push(worker)
        }
        await Promise.all(workers)
        console.log("All done with all classes")
    }
}

/** Renders a single `rdf:Property`.
 * Outputs all the triples from that property into the file
 * Either
 * - named via the `rdfs:label`
 * - using the name after the last slash of the property iri
 */
export async function renderProperty(propertyIRI: string, ontoFile: string) {
    const result = await myEngine.query(
        `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX schema: <http://schema.org/>
        
        SELECT ?label WHERE {
            <${propertyIRI}> rdf:type rdf:Property ;
                rdfs:label ?label
        }`,
        {
            sources: [
                {
                    type: "file",
                    value: ontoFile,
                },
            ],
        }
    )
    if (result.type !== "bindings") {
        throw new Error("No bindings")
    }
    const b = ((await result.bindings()) as unknown) as Bindings[]
    const label = b[0].get("?label")

    const out = await myEngine.query(
        `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX schema: <http://schema.org/>
        
        CONSTRUCT {
            <${propertyIRI}> ?p ?o .
        } WHERE {
            <${propertyIRI}> rdf:type rdf:Property ;
                ?p ?o .
        }`,
        {
            sources: [
                {
                    type: "file",
                    value: ontoFile,
                },
            ],
        }
    )

    if (out.type == "quads") {
        const ds: GraphyMemoryDataset = dataset()
        // ds.import(result.quadStream as Stream<Quad>)
        ds.addAll((await out.quads()) as Quad[])

        const norm = ds.canonicalize()

        serialize_all("/home/alex/c2/ontorender/work", label.value, norm)
    }
}

/**
 * Renders all noes of `rdf:Property` in a given file
 * @param ontoFile - the file of the ontology from which to render all properties
 */
export async function renderProperties(ontoFile: string) {
    const result = await myEngine.query(
        `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX schema: <http://schema.org/>
        
        SELECT ?s WHERE {
            ?s rdf:type rdf:Property .
        }`,
        {
            sources: [
                {
                    type: "file",
                    value: ontoFile,
                },
            ],
        }
    )
    if (result.type == "bindings") {
        const b = await result.bindings()

        // let obj = Object.fromEntries(b.entries())
        const workers = []
        for (let bind of b) {
            const a = (bind as unknown) as Map<string, NamedNode>

            const t = a.get("?s")!
            const iri = t.value
            console.log(`Starting to process IRI: ${iri}`)

            const worker = renderProperty(iri, ontoFile)
            workers.push(worker)
        }
        await Promise.all(workers)
        console.log("All done with all properties")
    }
}
