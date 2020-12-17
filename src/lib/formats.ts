export const formats = [
    {
        name: "Turtle",
        contentType: "text/turtle",
        extensions: [".ttl", ".turtle"],
    },
    {
        name: "N-Triples",
        contentType: "application/n-triples",
        extensions: [".nt", ".ntriples"],
    },
    {
        name: "JSON-LD",
        contentType: "application/ld+json",
        extensions: [".jsonld"],
    },
    // {
    //     name: "RDF/XML",
    //     contentType: "application/rdf+xml",
    //     extensions: [".rdf", ".rdfxml", ".owl"],
    // },
]

export const copies = [
    {
        name: "TriG",
        contentType: "application/trig",
        extensions: [".trig"],
        copyOf: ".ttl",
    },
    {
        name: "N-Quads",
        contentType: "application/n-quads",
        extensions: [".nq", ".nquads"],
        copyOf: ".nt",
    },
    {
        name: "Notation3",
        contentType: "text/n3",
        extensions: [".n3"],
        copyOf: ".ttl",
    },
]
