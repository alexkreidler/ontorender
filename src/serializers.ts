import rdfSerializer from "rdf-serialize"

import stringifyStream from "stream-to-string"

import { Stream } from "rdf-js"

export async function turtle(stream: Stream): Promise<string> {
    const textStream = rdfSerializer.serialize(stream, {
        contentType: "text/turtle",
        // path: "http://example.org/myfile.ttl",
    })
    const out = await stringifyStream(textStream)
    console.log(out)
    return out
}
