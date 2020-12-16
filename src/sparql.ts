import { LoggerPretty } from "@comunica/logger-pretty"
import { newEngine } from "@comunica/actor-init-sparql-file"
import { Quad } from "rdf-js"
import { serialize_all } from "./serializers"

export function prettyPrint(data: any): string {
    return JSON.stringify(data, undefined, 4)
}

import dataset from "@graphy/memory.dataset.fast"
import { GraphyMemoryDataset } from "extra-types"

import { OntologyRenderer } from "./base"

export class SparqlOntologyRenderer extends OntologyRenderer {
    private engine: ReturnType<typeof newEngine>
    constructor(input: string, output: string) {
        super(input, output)

        this.engine = newEngine()
    }
    query(sparql: string) {
        return this.engine.query(sparql, {
            // source: this.inputFile,
            sources: [
                {
                    type: "file",
                    value: this.inputFile,
                },
            ],

            log: new LoggerPretty({ level: "trace" }),

            // ],
        })
    }
    async entityResults(sparql: string) {
        const result = await this.query(sparql)
        if (result.type == "bindings") {
            const b = await result.bindings()

            return b.map((bnd) => bnd.get("?s")!.value)
        }
        console.warn(`Incorrect result type: ${result.type}`)

        return []
    }
    getProperties(): Promise<string[]> {
        const q = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX schema: <http://schema.org/>
        
        SELECT ?s WHERE {
            ?s rdf:type rdf:Property .
        }`
        console.log("Got properties")

        return this.entityResults(q)
    }
    getClasses(): Promise<string[]> {
        const q = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX schema: <http://schema.org/>
        
        SELECT ?s WHERE {
            ?s rdf:type rdfs:Class .
        }`
        console.log("Got classes")

        return this.entityResults(q)
    }
    async renderProperty(
        propertyIRI: string,
        propertyName: string
    ): Promise<void> {
        const q = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX schema: <http://schema.org/>
        
        CONSTRUCT {
            <${propertyIRI}> ?p ?o .
        } WHERE {
            <${propertyIRI}> rdf:type rdf:Property ;
                ?p ?o .
        }`
        const out = await this.query(q)

        if (out.type == "quads") {
            const ds: GraphyMemoryDataset = dataset()
            // out.metadata
            // ds.import(result.quadStream as Stream<Quad>)
            ds.addAll((await out.quads()) as Quad[])

            const norm = ds.canonicalize()

            await serialize_all(this.outputDirectory, propertyName, norm)
        }
    }
    async renderClass(classIRI: string, className: string): Promise<void> {
        const q = `
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
        }`

        const out = await this.query(q)

        if (out.type == "quads") {
            const ds: GraphyMemoryDataset = dataset()
            // ds.import(result.quadStream as Stream<Quad>)
            ds.addAll((await out.quads()) as Quad[])

            const norm = ds.canonicalize()

            await serialize_all(this.outputDirectory, className, norm)
        }
    }
}
