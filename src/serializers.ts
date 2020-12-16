import rdfSerializer from "rdf-serialize"

import stringifyStream from "stream-to-string"

import { Stream } from "rdf-js"
import { GraphyMemoryDataset } from "extra-types"

import { createReadStream, createWriteStream, promises } from "fs"

// this fixes a weird thing with importing in CJS mode
const mkdir = promises.mkdir
const stat = promises.stat

import { dirname, join } from "path"
import { formats } from "./formats"
// import { stat } from "fs/promises"

export async function turtle(stream: Stream): Promise<string> {
    const textStream = rdfSerializer.serialize(stream, {
        contentType: "text/turtle",
        // path: "http://example.org/myfile.ttl",
    })
    const out = await stringifyStream(textStream)
    console.log(out)
    return out
}

export async function nquads(stream: Stream): Promise<string> {
    const textStream = rdfSerializer.serialize(stream, {
        contentType: "application/n-quads",
        // path: "http://example.org/myfile.ttl",
    })
    const out = await stringifyStream(textStream)
    console.log(out)
    return out
}

export async function serialize_all(
    directory: string,
    name: string,
    data: GraphyMemoryDataset
): Promise<void> {
    // Todo: make this async based on Promise.all
    const workers = []
    for (let format of formats) {
        // console.log(`Beginning serialization to ${format.name} format!`)

        const filename = join(directory, name + format.extensions[0])
        // console.log(`Filename: ${filename}`)

        // We have to do this to copy the stream
        const fdata = data.match()
        const textStream = rdfSerializer.serialize(fdata, {
            contentType: format.contentType,
            // path: filename,
        })
        const fstream = createWriteStream(filename)
        textStream.pipe(fstream)
        const worker = new Promise<void>((resolve, reject) => {
            textStream.on("end", () => {
                // console.log(`Done writing in ${format.name} format!`)
                resolve()
            })
            textStream.on("error", reject)
        })
        workers.push(worker)
    }
    await Promise.all(workers)
    console.log("All done")
}
