# OntoRender

OntoRender, or the Ontology Renderer, is a tool that helps create a whole lot of files for every Class and Property in your ontology and for each different RDF serialization format available.

It was inspired by Schema.org's issues with content negotiation.

By pre-rendering your ontology in every format and from every HTTP endpoint, you can simply serve them all as static files, and add content negotiation similar to what's described [here](https://pieterheyvaert.com/blog/2019/02/25/nginx-conneg/)

    "rdf-store-stream": "^1.1.0",

    "rdf-data-factory": "^1.0.3",
