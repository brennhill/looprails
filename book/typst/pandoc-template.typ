#import "../typst/theme.typ": *

#show: doc => book-conf(
  kdp: $if(kdp)$true$else$false$endif$,
  title: [$title$],
  subtitle: [$subtitle$],
  author: [$author$],
  doc,
)

$if(toc)$
#pagebreak()
#context current-title.update(none)
#text(font: sans, size: 9pt, weight: "bold", tracking: 0.14em, fill: copper)[CONTENTS]
#v(18pt)
#outline(title: none, indent: 1.2em, depth: $toc-depth$)
#pagebreak()
$endif$

$body$

$if(finalblank)$
#page(header: none, footer: none)[]
$endif$
