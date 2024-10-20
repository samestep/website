interface Point {
  x: number;
  y: number;
}

interface Line {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

interface Circle {
  cx: number;
  cy: number;
  r: number;
}

// https://gist.github.com/jupdike/bfe5eb23d1c395d8a0a1a4ddd94882ac
const intersectCircleCircle = (c1: Circle, c2: Circle): Point[] => {
  const { cx: x1, cy: y1, r: r1 } = c1;
  const { cx: x2, cy: y2, r: r2 } = c2;

  const centerdx = x1 - x2;
  const centerdy = y1 - y2;
  const R = Math.sqrt(centerdx * centerdx + centerdy * centerdy);
  if (!(Math.abs(r1 - r2) <= R && R <= r1 + r2)) {
    // no intersection
    return []; // empty list of results
  }
  // intersection(s) should exist

  const R2 = R * R;
  const R4 = R2 * R2;
  const a = (r1 * r1 - r2 * r2) / (2 * R2);
  const r2r2 = r1 * r1 - r2 * r2;
  const c = Math.sqrt((2 * (r1 * r1 + r2 * r2)) / R2 - (r2r2 * r2r2) / R4 - 1);

  const fx = (x1 + x2) / 2 + a * (x2 - x1);
  const gx = (c * (y2 - y1)) / 2;
  const ix1 = fx + gx;
  const ix2 = fx - gx;

  const fy = (y1 + y2) / 2 + a * (y2 - y1);
  const gy = (c * (x1 - x2)) / 2;
  const iy1 = fy + gy;
  const iy2 = fy - gy;

  // note if gy == 0 and gx == 0 then the circles are tangent and there is only one solution
  // but that one solution will just be duplicated as the code is currently written
  return [
    { x: ix1, y: iy1 },
    { x: ix2, y: iy2 },
  ];
};

// https://mathworld.wolfram.com/Circle-LineIntersection.html
const intersectLineCircleOrigin = (l: Line, r: number): Point[] => {
  const { x1, x2, y1, y2 } = l;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dr = Math.hypot(dx, dy);
  const D = x1 * y2 - x2 * y1;
  const sgn = dy < 0 ? -1 : 1;
  const Delta = r * r * dr * dr - D * D;
  return [1, -1].map((s) => ({
    x: (D * dy + s * sgn * dx * Math.sqrt(Delta)) / (dr * dr),
    y: (-D * dx + s * Math.abs(dy) * Math.sqrt(Delta)) / (dr * dr),
  }));
};

const intersectLineCircle = (l: Line, c: Circle): Point[] => {
  const { x1, x2, y1, y2 } = l;
  const { cx, cy, r } = c;
  return intersectLineCircleOrigin(
    { x1: x1 - cx, x2: x2 - cx, y1: y1 - cy, y2: y2 - cy },
    r,
  ).map(({ x, y }) => ({ x: x + cx, y: y + cy }));
};

const s = 100;

const Gradient = ({ id, l }: { id: string; l: number }) => {
  return (
    <linearGradient
      id={id}
      gradientUnits="userSpaceOnUse"
      x1="0"
      x2={s}
      y1={s}
      y2="0"
    >
      <stop offset="0%" stop-color={`hsl(0 100% ${l}%)`} />
      <stop offset="20%" stop-color={`hsl(33 100% ${l}%)`} />
      <stop offset="40%" stop-color={`hsl(66 100% ${l}%)`} />
      <stop offset="60%" stop-color={`hsl(111 100% ${l}%)`} />
      <stop offset="80%" stop-color={`hsl(222 100% ${l}%)`} />
      <stop offset="100%" stop-color={`hsl(333 100% ${l}%)`} />
    </linearGradient>
  );
};

export const Logo = () => {
  const r2 = s / 3;
  const r1 = (s - 2 * r2) * Math.sqrt(2) - r2;
  const r1d = r1 / Math.sqrt(2);

  const both1 = [
    `M ${s} ${r2}`,
    `A ${r2} ${r2} 0 1 0 ${r2 + r1d} ${s - r2 - r1d}`,
    `L ${s - r2 - r1d} ${r2 + r1d}`,
    `A ${r1} ${r1} 0 1 1 ${s - r2 + r1} ${r2}`,
    `Z`,
  ];
  const both2 = [
    `M ${r2} ${s - r2 + r1}`,
    `A ${r1} ${r1} 0 0 1 ${r2 - r1} ${s - r2}`,
    `L 0 ${s - r2}`,
    `A ${r2} ${r2} 0 0 0 ${r2} ${s}`,
    `Z`,
  ];

  const d = 2;
  const dd = d / Math.sqrt(2);
  const horizontal: Line = { x1: 0, y1: s - r2 - d, x2: s, y2: s - r2 - d };
  const vertical: Line = { x1: r2 + d, y1: 0, x2: r2 + d, y2: s };
  const diagonal: Line = {
    x1: r2 + dd,
    y1: s - r2 + dd,
    x2: s - r2 + dd,
    y2: r2 + dd,
  };
  const inner: Circle = { cx: r2, cy: s - r2, r: r1 + d };
  const outer: Circle = { cx: r2, cy: s - r2, r: r2 - d };
  const mask: Circle = { cx: s - r2, cy: r2, r: r2 + d };

  const S0 = intersectLineCircle(diagonal, inner)[1];
  const S1 = intersectLineCircle(vertical, inner)[0];
  const S2 = intersectLineCircle(vertical, outer)[0];
  const S3 = intersectLineCircle(diagonal, outer)[1];
  const first = [
    `M ${S0.x} ${S0.y}`,
    `A ${r1 + d} ${r1 + d} 0 0 1 ${S1.x} ${S1.y}`,
    `L ${S2.x} ${S2.y}`,
    `A ${r2 - d} ${r2 - d} 0 0 0 ${S3.x} ${S3.y}`,
    `Z`,
  ];

  const E0 = intersectLineCircle(horizontal, inner)[1];
  const E1 = intersectCircleCircle(inner, mask)[0];
  const E2 = intersectCircleCircle(outer, mask)[0];
  const E3 = intersectLineCircle(horizontal, outer)[1];
  const last = [
    `M ${E0.x} ${E0.y}`,
    `A ${r1 + d} ${r1 + d} 0 0 1 ${E1.x} ${E1.y}`,
    `A ${r2 - d} ${r2 - d} 0 0 1 ${E2.x} ${E2.y}`,
    `A ${r2 - d} ${r2 - d} 0 0 0 ${E3.x} ${E3.y}`,
    `Z`,
  ];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox={`0 0 ${s} ${s}`}
    >
      <defs>
        <Gradient id="one" l={90} />
        <Gradient id="both" l={75} />
      </defs>
      <path d={first.join(" ")} fill="url(#one)" />
      <path d={last.join(" ")} fill="url(#one)" />
      <path d={both1.join(" ")} fill="url(#both)" />
      <path d={both2.join(" ")} fill="url(#both)" />
    </svg>
  );
};
