import { computeName } from "../src/utils"

describe("computeName", () => {
    it("should work for many IRIs", () => {
        // const r = new OntologyRenderer("foo", "bar");
        const tests = [
            { iri: "http://schema.org/domainIncludes", name: "domainIncludes" },
            {
                iri: "http://schema.org/CommunicateAction",
                name: "CommunicateAction",
            },
            {
                iri: "http://www.w3.org/2000/01/rdf-schema#comment",
                name: "comment",
            },
            {
                iri: "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property",
                name: "Property",
            },
            {
                iri: "http://www.w3.org/2004/02/skos/core#Concept",
                name: "Concept",
            },
        ]

        for (let test of tests) {
            expect(computeName(test.iri)).toBe(test.name)
        }
    })

    it("should return blank for root ontologies", () => {
        const roots = [
            // Should the following work or return an error?
            "http://openforecasting.org/ontology/",
            "http://www.w3.org/2004/02/skos/core#",
        ]

        for (let iri of roots) {
            expect(computeName(iri)).toBe("")
        }
    })

    // TODO: properly handle this
    it("should return blank for malformed IRIs", () => {
        const iris = [
            // "p://www.w3.org/2004/02/skos/core",
            "http://",
            "",
            "/",
            "urn:",
            ":",
        ]

        for (let iri of iris) {
            expect(computeName(iri)).toBe("")
        }
    })
})
