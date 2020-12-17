import rdfSerializer from "rdf-serialize"

import { DatasetCore, Quad, Stream } from "rdf-js"

import { createWriteStream } from "fs"

import { formats } from "./formats"
import { join } from "path"

export async function serialize_all(
    directory: string,
    name: string,
    data: DatasetCore & Stream<Quad>
): Promise<void> {
    // Todo: make this async based on Promise.all
    const workers = []
    for (let format of formats) {
        // console.log(`Beginning serialization to ${format.name} format!`)

        const filename = join(directory, name + format.extensions[0])
        // console.log(`Filename: ${filename}`)

        const textStream = rdfSerializer.serialize(data, {
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
    // console.log("All done")
}
