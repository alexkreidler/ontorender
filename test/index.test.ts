import { foo, generate } from "../src/index"

import { select } from "../src/sparql"

test("basic", () => {
    expect(foo()).toBeDefined()
})

test("generate from schema.org", async () => {
    await generate("/home/alex/c2/schemaorg/data/schema.ttl")
})

test("sparql", async () => {
    await select()
}, 99999)
