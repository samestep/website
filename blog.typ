#let width = 300

#let svg(height, body) = html.elem("div", attrs: (class: "svg"), html.elem("svg", attrs: (
  viewBox: "0 0 " + str(width) + " " + str(height),
  height: str(height),
))[#body])
