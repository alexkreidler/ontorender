# OntoRender

OntoRender, or the Ontology Renderer, is a tool that helps create a whole lot of files for every Class and Property in your ontology and for each different RDF serialization format available.

It was inspired by Schema.org's issues with content negotiation.

By pre-rendering your ontology in every format and from every HTTP endpoint, you can simply serve them all as static files, and add content negotiation similar to what's described [here](https://pieterheyvaert.com/blog/2019/02/25/nginx-conneg/)

We recently released v2, which changed the architecture from using [Comunica](https://comunica.dev)'s SPARQL query library for local files to simply parsing the entire ontology into an in-memory RDF/JS Dataset, and performing the appropriate subset selection using the [Clownface](https://github.com/zazuko/clownface) library. The first version resulted in some wierd bugs and out of memory errors, and led me to try to introduce a limit on the default concurrency of Promises using p-limit.

## Next steps

-   Add superclass properties to classes (so clients don't need inference)
-   Think about adding range properties
-   Possibly generate HTML pages from data using 11ty, Next or some other templating engine. Likely better than raw in JS

## Possible performance improvements

Currently we can render the entire Schema.org ontology in under 3s on a 16 core Ryzen desktop. This is expected to be faster for smaller ontologies.

-   Evaluate graphy vs other libraries for in memory data model
-   Determine execution of handlePointer (e.g. parallel in the map() call vs inside the promise to potentially optimize)
-   Even when properties and classes were in parallel (w/ Promise.all), the names for the nodes were generated in same order
-   Benchmark inside renderProperty and renderClass
-   Evaluate if async/await syntax has any overhead in performance from the generated code (e.g. `__awaiter` etc)

### File format equality

This may speed up output

n3, trig, and ttl or turtle are equivalent

for these graphs, nt and nq are equivalent
