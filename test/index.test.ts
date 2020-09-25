import { foo, generate } from "../src/index";

test("basic", () => {
  expect(foo()).toBeDefined();
});

test("generate from schema.org", async () => {
  await generate("/home/alex/c2/schemaorg/data/schema.ttl");
});
