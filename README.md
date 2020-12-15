# OntoRender

OntoRender, or the Ontology Renderer, is a tool that helps create a whole lot of files for every Class and Property in your ontology and for each different RDF serialization format available.

It was inspired by Schema.org's issues with content negotiation.

By pre-rendering your ontology in every format and from every HTTP endpoint, you can simply serve them all as static files, and add content negotiation similar to what's described [here](https://pieterheyvaert.com/blog/2019/02/25/nginx-conneg/)

<!-- Removed packages
"rdf-store-stream": "^1.1.0",

"rdf-data-factory": "^1.0.3",
-->

## Next steps

-   Add superclass properties to classes (so clients don't need inference)
-   Think about adding range properties
-   Possibly generate HTML pages from data using 11ty or some other templating engine. Likely better than raw in JS

## Client Side Content-Negotiation

OPTIONS /Resource

X-Supports-CSCN: true
X-Supported-Types: application/ld+json, ..., mime/types

## File format equality

This may speed up output

n3, trig, and ttl or turtle are equivalent

for these graphs, nt and nq are equivalent
