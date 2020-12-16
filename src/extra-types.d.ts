// import {
//     BlankNode,
//     Dataset,
//     DefaultGraph,
//     Literal,
//     NamedNode,
//     Quad,
//     Stream,
//     Term,
//     Variable,
// } from "rdf-js"

// declare class GraphyMemoryDataset implements Dataset, Stream<Quad> {
//     read(): Quad | null
//     addListener(
//         event: string | symbol,
//         listener: (...args: any[]) => void
//     ): this
//     on(event: string | symbol, listener: (...args: any[]) => void): this
//     once(event: string | symbol, listener: (...args: any[]) => void): this
//     removeListener(
//         event: string | symbol,
//         listener: (...args: any[]) => void
//     ): this
//     off(event: string | symbol, listener: (...args: any[]) => void): this
//     removeAllListeners(event?: string | symbol): this
//     setMaxListeners(n: number): this
//     getMaxListeners(): number
//     listeners(event: string | symbol): Function[]
//     rawListeners(event: string | symbol): Function[]
//     emit(event: string | symbol, ...args: any[]): boolean
//     listenerCount(type: string | symbol): number
//     prependListener(
//         event: string | symbol,
//         listener: (...args: any[]) => void
//     ): this
//     prependOnceListener(
//         event: string | symbol,
//         listener: (...args: any[]) => void
//     ): this
//     eventNames(): (string | symbol)[]
//     addAll(quads: Dataset<Quad, Quad> | Quad[]): this
//     contains(other: Dataset<Quad, Quad>): boolean
//     deleteMatches(
//         subject?: Term,
//         predicate?: Term,
//         object?: Term,
//         graph?: Term
//     ): this
//     difference(other: Dataset<Quad, Quad>): Dataset<Quad, Quad>
//     equals(other: Dataset<Quad, Quad>): boolean
//     every(
//         iteratee: (quad: Quad, dataset: Dataset<Quad, Quad>) => boolean
//     ): boolean
//     filter(
//         iteratee: (quad: Quad, dataset: Dataset<Quad, Quad>) => boolean
//     ): Dataset<Quad, Quad>
//     forEach(iteratee: (quad: Quad, dataset: Dataset<Quad, Quad>) => void): void
//     import(stream: Stream<Quad>): Promise<this>
//     intersection(other: Dataset<Quad, Quad>): this
//     map(
//         iteratee: (quad: Quad, dataset: Dataset<Quad, Quad>) => Quad
//     ): Dataset<Quad, Quad>
//     reduce<A = any>(
//         iteratee: (
//             accumulator: A,
//             quad: Quad,
//             dataset: Dataset<Quad, Quad>
//         ) => A,
//         initialValue?: A
//     ): A
//     some(
//         iteratee: (quad: Quad, dataset: Dataset<Quad, Quad>) => boolean
//     ): boolean
//     /** The to functions aren't impled */
//     toArray(): Quad[]
//     /** The to functions aren't impled */
//     toCanonical(): string
//     /** The to functions aren't impled */
//     toStream(): Stream<Quad>
//     /** The to functions aren't impled */
//     toString(): string

//     union(quads: Dataset<Quad, Quad>): Dataset<Quad, Quad>
//     match(
//         subject?:
//             | NamedNode<string>
//             | BlankNode
//             | Literal
//             | Variable
//             | DefaultGraph
//             | null,
//         predicate?:
//             | NamedNode<string>
//             | BlankNode
//             | Literal
//             | Variable
//             | DefaultGraph
//             | null,
//         object?:
//             | NamedNode<string>
//             | BlankNode
//             | Literal
//             | Variable
//             | DefaultGraph
//             | null,
//         graph?:
//             | NamedNode<string>
//             | BlankNode
//             | Literal
//             | Variable
//             | DefaultGraph
//             | null
//     ): GraphyMemoryDataset
//     size: number
//     add(quad: Quad): this
//     delete(quad: Quad): this
//     has(quad: Quad): boolean
//     [Symbol.iterator](): Iterator<Quad, any, undefined>
//     canonicalize(): GraphyMemoryDataset
// }
