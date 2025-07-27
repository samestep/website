#import "../../../blog.typ": svg, width

#let caches = {
  let height = 400
  let cores = 6
  let gap = 4
  let stroke = "#666"
  let w = width / cores
  let l2 = 24
  let scale = l2 / 512
  let y0 = 20
  let l3 = (32 * 1024 * scale) / 6
  let ram = height - (y0 + l2 + l3)
  let y0ram = y0 + l2 + l3 + gap
  let y1ram = y0 + l2 + l3 + ram - gap
  let x0 = gap
  let x1 = width - gap
  svg(height)[
    #html.elem("defs")[
      #html.elem("linearGradient", attrs: (id: "ramFill", x1: "0", x2: "0", y1: "0", y2: "1"))[
        #html.elem("stop", attrs: (offset: "0%", stop-color: "hsl(0 50% 50%)"))
        #html.elem("stop", attrs: (offset: "1000%", stop-color: "hsl(0 50% 50% / 0%)"))
      ]
      #html.elem("linearGradient", attrs: (id: "ramStroke", x1: "0", x2: "0", y1: "0", y2: "1"))[
        #html.elem("stop", attrs: (offset: "0%", stop-color: stroke))
        #html.elem("stop", attrs: (offset: "100%", stop-color: stroke + "0"))
      ]
    ]
    #(
      range(0, cores)
        .map(i => {
          let x = i * w
          let y = y0
          [
            #html.elem("text", attrs: (
              x: str(x + w / 2),
              y: str(y - 2 * gap),
              fill: "white",
              text-anchor: "middle",
              dominant-baseline: "text-bottom",
            ))[L1]
            #html.elem("line", attrs: (
              x1: str(x + gap),
              y1: str(y - gap),
              x2: str(x + w - gap),
              y2: str(y - gap),
              stroke: str(stroke),
              stroke-width: str(scale * 64),
            ))
          ]
        })
        .join()
    )
    #(
      range(0, cores)
        .map(i => {
          let h = l2
          let x = i * w
          let y = y0
          [
            #html.elem("rect", attrs: (
              x: str(x + gap),
              y: str(y + gap),
              width: str(w - 2 * gap),
              height: str(h - 2 * gap),
              fill: "hsl(111 50% 50%)",
              stroke: str(stroke),
              stroke-width: "2",
            ))
            #html.elem("text", attrs: (
              x: str(x + w / 2),
              y: str(y + h / 2),
              fill: "white",
              text-anchor: "middle",
              dominant-baseline: "central",
            ))[L2]
          ]
        })
        .join()
    )
    #html.elem("rect", attrs: (
      x: str(gap),
      y: str(y0 + l2 + gap),
      width: str(width - 2 * gap),
      height: str(l3 - 2 * gap),
      fill: "hsl(222 50% 50%)",
      stroke: str(stroke),
      stroke-width: "2",
    ))
    #html.elem("text", attrs: (
      x: str(width / 2),
      y: str(y0 + l2 + l3 / 2),
      fill: "white",
      text-anchor: "middle",
      dominant-baseline: "central",
    ))[L3]
    #html.elem("polyline", attrs: (
      points: str(x1)
        + ","
        + str(y1ram)
        + " "
        + str(x1)
        + ","
        + str(y0ram)
        + " "
        + str(x0)
        + ","
        + str(y0ram)
        + " "
        + str(x0)
        + ","
        + str(y1ram),
      fill: "url(#ramFill)",
      stroke: "url(#ramStroke)",
      stroke-width: "2",
    ))
    #html.elem("text", attrs: (
      x: str(width / 2),
      y: str(y0 + l2 + l3 + ram / 2),
      fill: "white",
      text-anchor: "middle",
      dominant-baseline: "central",
    ))[RAM]
  ]
}
