import { Command, flags } from "@oclif/command"
import { render } from "../lib/render"
class OntologyRender extends Command {
    static description =
        "ontorender (or the Ontology Renderer) is a tool to help you distribute your ontology as separate static files for various RDF formats."

    static flags = {
        // add --version flag to show CLI version
        version: flags.version({ char: "v" }),
        help: flags.help({ char: "h" }),

        from: flags.string({
            description: "ontology file to render from",
            required: true,
        }),
        to: flags.string({
            description: "directory to render into",
            required: true,
        }),

        force: flags.boolean({ description: "overwrites existing files" }),

        markdown: flags.boolean({
            char: "m",
            description: "generates markdown descriptions of ontology",
        }),
    }

    static args = [{ name: "file" }]

    async run() {
        const { args, flags } = this.parse(OntologyRender)

        await render(flags.from, flags.to, flags.force, flags.markdown)
    }
}

export = OntologyRender
