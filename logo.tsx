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
  const r2 = 32;
  const r1 = (s - 2 * r2) * Math.sqrt(2) - r2;
  const r1d = r1 / Math.sqrt(2);
  const a = 2;
  const b = -2 * s;
  const c = (s - r2) ** 2;
  const z = (-b - Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a);
  const first = [
    `M ${s} ${r2}`,
    `A ${r2} ${r2} 0 1 0 ${r2 + r1d} ${s - r2 - r1d}`,
    `A ${r1} ${r1} 0 1 1 ${r2 - r1} ${s - r2}`,
    `L 0 ${s - r2}`,
    `A ${r2} ${r2} 0 1 0 ${s - r2 - r1d} ${r2 + r1d}`,
    `A ${r1} ${r1} 0 1 1 ${s - r2 + r1} ${r2}`,
    `Z`,
  ];
  const last = [
    `M ${s} ${r2}`,
    `A ${r2} ${r2} 0 1 0 ${z} ${z}`,
    `A ${r2} ${r2} 0 1 0 ${r2} ${s}`,
    `L ${r2} ${s - r2 + r1}`,
    `A ${r1} ${r1} 0 1 1 ${r2 + r1d} ${s - r2 - r1d}`,
    `L ${s - r2 - r1d} ${r2 + r1d}`,
    `A ${r1} ${r1} 0 1 1 ${s - r2 + r1} ${r2}`,
    `Z`,
  ];
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
