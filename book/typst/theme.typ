#let navy = rgb("#17324D")
#let copper = rgb("#A85F32")
#let gold = rgb("#C6922A")
#let body = rgb("#252A2E")
#let muted = rgb("#6B7280")
#let paper = rgb("#FCFAF6")
#let code-bg = rgb("#F2EFE9")
#let rule = rgb("#D7CFC3")

#let serif = ("Iowan Old Style", "Georgia", "Times New Roman")
#let sans = ("Avenir Next", "Helvetica Neue", "Arial")
#let mono = ("Menlo", "DejaVu Sans Mono")

#let horizontalrule = line(start: (25%, 0%), end: (75%, 0%), stroke: 0.5pt + rule)

#let chapter-number = counter("chapter-number")
#let current-title = state("current-title", none)
#let is-part-page = state("is-part-page", false)

#let outline-section(text-value) = {
  text-value.contains("Part") or text-value.contains("The Field Kit")
}

#let special-title(text-value) = {
  (
    text-value.contains("Preface")
    or text-value.contains("Appendix")
    or text-value.contains("Glossary")
    or text-value.contains("References")
    or text-value.contains("About the Author")
  )
}

#let running-header = context {
  []
}

#let running-footer = context {
  if not is-part-page.get() {
    grid(
      columns: (1fr, auto, 1fr),
      text(font: sans, size: 7.5pt, fill: muted)[Measure Twice, Prompt Once],
      text(font: sans, size: 8pt, fill: muted)[#counter(page).display()],
      [],
    )
  }
}

#let part-divider(roman, title) = {
  context is-part-page.update(true)
  context current-title.update(none)
  pagebreak(weak: true)
  block(height: 0pt, clip: true)[
    #if roman != "" {
      heading(level: 1, outlined: true, bookmarked: true, supplement: [BOOKPART])[Part #roman: #title]
    } else {
      heading(level: 1, outlined: true, bookmarked: true, supplement: [BOOKPART])[#title]
    }
  ]
  v(1.8in)
  align(center)[
    #set par(justify: false, leading: 0.18em)
    #if roman != "" {
      text(font: sans, size: 9pt, weight: "bold", tracking: 0.18em, fill: gold)[PART #roman]
      v(22pt)
    }
    #line(length: 42pt, stroke: 2pt + copper)
    #v(22pt)
    #text(font: serif, size: 31pt, weight: "bold", fill: navy)[#title]
  ]
  pagebreak()
  context is-part-page.update(false)
}

#let title-page(title, subtitle, author) = {
  page(header: none, footer: none)[
    #v(1.45in)
    #align(center)[
      #set par(justify: false, leading: 0.18em)
      #text(font: serif, size: 37pt, weight: "bold", fill: navy)[#title]
      #v(18pt)
      #block(width: 75%)[
        #set par(justify: false, leading: 0.45em)
        #text(font: sans, size: 12pt, tracking: 0.05em, fill: copper)[#upper(subtitle)]
      ]
      #v(38pt)
      #line(length: 54pt, stroke: 2.5pt + gold)
      #v(38pt)
      #text(font: sans, size: 15pt, fill: body)[#author]
    ]
  ]
}

#let half-title(title) = {
  page(header: none, footer: none)[
    #v(2.5in)
    #align(center)[
      #set par(justify: false, leading: 0.18em)
      #text(font: serif, size: 27pt, weight: "bold", fill: navy)[#title]
    ]
  ]
  page(header: none, footer: none)[]
}

#let copyright-page() = {
  page(header: none, footer: none)[
    #v(3.4in)
    #block(width: 100%)[
      #set text(font: serif, size: 8pt, fill: muted)
      #set par(justify: false, leading: 0.55em)
      Copyright © 2026 Brenn Hill. All rights reserved.

      No part of this publication may be reproduced without prior written permission, except for brief quotations used in reviews, commentary, and uses permitted by law.

      First edition, 2026. Published independently.

      This book is provided for educational purposes. AI systems, benchmarks, products, and regulations change quickly. Readers remain responsible for evaluating practices in their own technical, legal, safety, and organizational contexts.

      ISBN (Paperback): pending. ASIN (Kindle): pending.

      Cover concept and direction: Brenn Hill. Cover illustration created with Nano Banana 2.

      looprails.com
    ]
  ]
}

#let book-conf(kdp: false, title: "Measure Twice, Prompt Once", subtitle: "", author: "Brenn Hill", doc) = {
  set document(title: "Measure Twice, Prompt Once", author: ("Brenn Hill",))
  set page(
    width: 6in,
    height: 9in,
    margin: if kdp {
      (top: 0.7in, bottom: 0.75in, inside: 0.7in, outside: 0.6in)
    } else {
      (top: 0.62in, bottom: 0.72in, inside: 0.78in, outside: 0.68in)
    },
    fill: if kdp { white } else { paper },
    header: running-header,
    footer: running-footer,
  )
  set text(font: serif, size: if kdp { 10.5pt } else { 10.2pt }, fill: body)
  set par(justify: true, leading: 0.45em)
  set list(indent: 1.2em, body-indent: 0.5em, spacing: 0.45em)
  set enum(indent: 1.2em, body-indent: 0.5em, spacing: 0.45em)
  set table(inset: 5pt, stroke: 0.35pt + rule)
  show link: set text(fill: copper)
  show raw.where(block: true): it => block(
    width: 100%,
    fill: code-bg,
    inset: 8pt,
    radius: 2pt,
    breakable: true,
    text(font: mono, size: 8pt, it),
  )
  show raw.where(block: false): it => text(font: mono, size: 8.5pt, it)
  show table: it => block(above: 8pt, below: 10pt, it)
  show quote: it => block(
    width: 84%,
    inset: (left: 14pt),
    stroke: (left: 1.5pt + copper),
    text(style: "italic", fill: muted, it.body),
  )
  show outline.entry: it => context {
    let plain = repr(it.element.body)
    let loc = it.element.location()
    let pg = counter(page).at(loc).first()
    if outline-section(plain) {
      v(6pt)
      block(width: 100%)[
        #set text(font: sans, size: 9.2pt, weight: "bold", tracking: 0.04em, fill: navy)
        #upper(it.element.body)
        #h(1fr)
        #str(pg)
      ]
      v(1pt)
    } else if special-title(plain) {
      if plain.contains("Glossary") { v(5pt) }
      block(width: 100%)[
        #set text(font: serif, size: 9.8pt, weight: "bold", fill: body)
        #it.element.body
        #box(width: 1fr, repeat[.])
        #str(pg)
      ]
    } else {
      block(width: 100%)[
        #set text(font: serif, size: 9.8pt, fill: body)
        #h(1em)
        #it.element.body
        #box(width: 1fr, repeat[.])
        #str(pg)
      ]
    }
  }
  show heading.where(level: 1): it => {
    let title-text = repr(it.body)
    let is-book-part = repr(it.supplement).contains("BOOKPART")
    if is-book-part {
      []
    } else {
      pagebreak(weak: true)
      context current-title.update(it.body)
      if not special-title(title-text) {
        chapter-number.step()
        context text(font: sans, size: 8.5pt, weight: "bold", fill: gold, tracking: 0.12em)[CHAPTER #chapter-number.display()]
        v(14pt)
      }
      block(width: 82%)[
        #set par(justify: false, leading: 0.15em)
        #text(font: serif, size: 29pt, weight: "bold", fill: navy)[#it.body]
      ]
      v(17pt)
    }
  }
  show heading.where(level: 2): it => block(above: 21pt, below: 8pt)[
    #set par(justify: false)
    #text(font: sans, size: 11pt, weight: "semibold", tracking: 0.06em, fill: copper)[#upper(it.body)]
  ]
  show heading.where(level: 3): it => block(above: 13pt, below: 5pt)[
    #set par(justify: false)
    #text(font: sans, size: 11pt, weight: "semibold", fill: navy)[#it.body]
  ]

  half-title(title)
  title-page(title, subtitle, author)
  copyright-page()
  doc
}
