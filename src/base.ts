import { computeName } from "./utils"
import pLimit from "p-limit"

const limit = pLimit(3)

export abstract class OntologyRenderer {
    protected inputFile: string
    protected outputDirectory: string

    constructor($inputFile: string, $outputDirectory: string) {
        this.inputFile = $inputFile
        this.outputDirectory = $outputDirectory
    }
    computeName = computeName

    /** Get all properties from the input file */
    abstract getProperties(): Promise<string[]>

    /** Get all classes from the input file */
    abstract getClasses(): Promise<string[]>

    /** Output a property to the output firectory */
    abstract renderProperty(
        propertyIRI: string,
        propertyName: string
    ): Promise<void>

    /** Output a class to the output firectory */
    abstract renderClass(classIRI: string, className: string): Promise<void>

    async renderProperties() {
        console.log("Rendering properties")

        const ps = await this.getProperties()

        await Promise.all(
            ps.map((iri) =>
                limit(async () => {
                    const propertyName = computeName(iri)
                    console.log("Starting render for property", propertyName)
                    await this.renderProperty(iri, propertyName)
                    console.log("Done with render for property", propertyName)
                })
            )
        )
    }
    async renderClasses() {
        console.log("Rendering classes")

        const ps = await this.getClasses()
        await Promise.all(
            ps.map((iri) =>
                limit(async () => {
                    const className = computeName(iri)
                    console.log("Starting render for class", className)
                    await this.renderClass(iri, className)
                    console.log("Done with render for class", className)
                })
            )
        )
    }

    async render() {
        return this.renderClasses().then(() => this.renderProperties())
        // const tasks = [this.renderClasses(), this.renderProperties()]
        // await Promise.all(tasks)
    }
}
