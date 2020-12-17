import rdfSerializer from "rdf-serialize"

import { DatasetCore, Quad, Stream } from "rdf-js"

import fs, { createWriteStream } from "fs"

import { formats } from "./formats"
import { join } from "path"

export async function serialize_all(
    directory: string,
    name: string,
    data: DatasetCore & Stream<Quad>,
    force: boolean
): Promise<void> {
    const workers = []
    for (let format of formats) {
        const filename = join(directory, name + format.extensions[0])

        if (fs.existsSync(filename) && !force) {
            throw new Error(
                `File already exists and force mode was off: ${filename}`
            )
        }
        const fstream = createWriteStream(filename)

        const textStream = rdfSerializer.serialize(data, {
            contentType: format.contentType,
            // path: filename,
        })
        textStream.pipe(fstream)
        const worker = new Promise<void>((resolve, reject) => {
            textStream.on("end", () => {
                resolve()
            })
            textStream.on("error", reject)
        })
        workers.push(worker)
    }
    await Promise.all(workers)
}
