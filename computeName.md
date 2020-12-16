## Acceptable IRIs for input to create names

From the RDF spec:

> Note
>
> **URIs and IRIs:** IRIs are a generalization of URIs \[[RFC3986](#bib-RFC3986)\] that permits a wider range of Unicode characters. Every absolute URI and URL is an IRI, but not every IRI is an URI. When IRIs are used in operations that are only defined for URIs, they must first be converted according to the mapping defined in [section 3.1](http://tools.ietf.org/html/rfc3987#section-3.1) of \[[RFC3987](#bib-RFC3987)\]. A notable example is retrieval over the HTTP protocol. The mapping involves UTF-8 encoding of non-ASCII characters, %-encoding of octets not allowed in URIs, and Punycode-encoding of domain names.
>
> **Relative IRIs:** Some [concrete RDF syntaxes](#dfn-concrete-rdf-syntax "concrete RDF syntax") permit relative IRIs as a convenient shorthand that allows authoring of documents independently from their final publishing location. Relative IRIs must be [resolved against](http://tools.ietf.org/html/rfc3986#section-5.2) a base IRI to make them absolute. Therefore, the RDF graph serialized in such syntaxes is well-defined only if a [base IRI can be established](http://tools.ietf.org/html/rfc3986#section-5.1) \[[RFC3986](#bib-RFC3986)\].
>
> **IRI normalization:** Interoperability problems can be avoided by minting only IRIs that are normalized according to [Section 5](http://tools.ietf.org/html/rfc3987#section-5) of \[[RFC3987](#bib-RFC3987)\]. Non-normalized forms that are best avoided include:
>
> -   Uppercase characters in scheme names and domain names
> -   Percent-encoding of characters where it is not required by IRI syntax
> -   Explicitly stated HTTP default port (`http://example.com:80/`); `http://example.com/` is preferable
> -   Completely empty path in HTTP IRIs (`http://example.com`); `http://example.com/` is preferable
> -   “`/./`” or “`/../`” in the path component of an IRI
> -   Lowercase hexadecimal letters within percent-encoding triplets (“`%3F`” is preferable over “`%3f`”)
> -   Punycode-encoding of Internationalized Domain Names in IRIs
> -   IRIs that are not in Unicode Normalization Form C \[[NFC](#bib-NFC)\]
