/** Computes the name: or what comes after after the prefix for the ontology
 * (e.g. for schema:Person Person, skos:Concept Concept).
 * Sometimes this is the rdfs:label, but not always  */
export const computeName = (iri: string): string => {
    const hashIdx = iri.lastIndexOf("#")
    const slashIdx = iri.lastIndexOf("/")
    let out =
        hashIdx !== -1
            ? iri.substring(hashIdx + 1)
            : slashIdx !== -1
            ? iri.substring(slashIdx + 1)
            : ""

    if (out == "") {
        console.warn("Preparing to output empty name for input", iri)
    }
    return out
}
