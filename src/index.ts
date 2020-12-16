import { newEngine } from "@comunica/actor-init-sparql-file"
import { SparqlOntologyRenderer } from "./sparql"

const inp = "/home/alex/c2/schemaorg/data/schema.ttl"

const renderer = new SparqlOntologyRenderer(
    inp,
    "/home/alex/c2/ontorender/work2"
)

console.log("Started")

renderer
    .render()
    .then(() => {
        console.log("Completed")
    })
    .catch((e) => console.error(e))

// const eng = newEngine()
// const propertyIRI = "http://schema.org/givenName"
// eng.query(
//     `
//         PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
//         PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
//         PREFIX schema: <http://schema.org/>

//         CONSTRUCT {
//             <${propertyIRI}> ?p ?o .
//         } WHERE {
//             <${propertyIRI}> rdf:type rdf:Property ;
//                 ?p ?o .
//         }`,
//     //     `
//     //  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
//     //  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
//     //  PREFIX schema: <http://schema.org/>

//     //  SELECT ?s WHERE {
//     //      ?s rdf:type rdf:Property .
//     //  }`,
//     {
//         // source: this.inputFile,
//         sources: [
//             {
//                 type: "file",
//                 value: inp,
//             },
//         ],

//         // log: new LoggerPretty({ level: "trace" }),

//         // ],
//     }
// )
//     .then(async (out) => {
//         if (out.type == "quads") {
//             // out.metadata
//             // ds.import(result.quadStream as Stream<Quad>)
//             const qs = await out.quads()

//             console.log(qs[0])
//         }
//     })
//     .catch((e) => console.error(e))
