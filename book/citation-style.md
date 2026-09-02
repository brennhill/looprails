# Citation House Style

The manuscript uses a numbered notes system based loosely on Chicago Notes and Bibliography, adapted for technical publications that change after release.

## Editorial keys and reader notes

- Write stable source keys such as `[SWE-03]` in source Markdown.
- Never renumber or reuse a stable key in `codex.md`.
- The publishing build converts keys into superscript numbered links and converts `references.md` entries into matching numbered notes.
- Stable keys remain in the Markdown and codex for fact checking; they do not appear in the EPUB or print interior.
- Put a citation immediately after the claim it supports. A citation at the end of a paragraph supports only the claims that clearly lead to it.
- Cite the primary source for research findings, benchmark design, software behavior, and organization-specific practices whenever one exists.

## Reference forms

Use these forms consistently:

- **Book:** Author. *Title*. Edition. Year. URL or DOI.
- **Paper:** Author or first author et al. “Title.” Venue, year. DOI or arXiv identifier and version. URL.
- **Web article:** Author or organization. “Title.” Site or publisher, publication date or year. URL.
- **Documentation:** Organization. “Page Title.” Product or documentation set. URL.
- **Repository:** Organization or maintainer. *owner/repository*. GitHub repository. URL.
- **Dataset:** Organization or author. *Dataset title*. Hosting service dataset card. URL.
- **Podcast or video interview:** Host, role. “Episode title.” Interview with guest or guests. *Show title*, publication date. Medium and duration. URL.

Use sentence-style capitalization for titles unless the published title contains a proper name or intentional capitalization. Italicize books, datasets, and repository names; place article, paper, page, and documentation titles in quotation marks. End every entry with a period. Do not include access dates in the reader bibliography; keep access dates, commits, revisions, claim boundaries, and reuse cautions in `codex.md`.

## Versions and dates

- Include a publication date when the source publishes one; otherwise use the year.
- For arXiv papers, include the identifier, version, and year. Do not imply peer review unless a venue is named.
- For mutable documentation and repositories, name the artifact without pretending the current page is permanent. Pin the checked version or commit in `codex.md`.
- When an organization is both author and publisher, name it once.

## Names and links

- List all authors for one to three authors. For four or more, use the first author followed by “et al.” unless a fuller list materially helps identification.
- Use the name shown by the source. Preserve organization names and diacritics.
- Link to the canonical paper, documentation, repository, or publisher page—not a search result or secondary summary.
