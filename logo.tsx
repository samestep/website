export const Logo = () => {
  const z = 54;
  const r = 11;
  const a = [55, 70];
  const b = [58, 80];
  const c = [25, 96];
  const d = [12, 45];
  const w = 44;
  const segments = [
    `M ${z} ${z}`,
    `A ${r} ${r} 0 1 0 ${a[0]} ${a[1]}`,
    `L ${b[0]} ${b[1]}`,
    `C ${c[0]} ${c[1]}, ${d[0]} ${d[1]}, ${w} ${w}`,
    `C ${d[1]} ${d[0]}, ${c[1]} ${c[0]}, ${b[1]} ${b[0]}`,
    `L ${a[1]} ${a[0]}`,
    `A ${r} ${r} 0 1 0 ${z} ${z}`,
  ];
  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="25 25 59 59">
      <defs>
        <linearGradient id="rainbow" x1="0" x2="1" y1="1" y2="0">
          <stop offset="0%" stop-color="hsl(0 100% 85%)" />
          <stop offset="20%" stop-color="hsl(33 100% 85%)" />
          <stop offset="40%" stop-color="hsl(66 100% 85%)" />
          <stop offset="60%" stop-color="hsl(111 100% 85%)" />
          <stop offset="80%" stop-color="hsl(222 100% 85%)" />
          <stop offset="100%" stop-color="hsl(333 100% 85%)" />
        </linearGradient>
      </defs>
      <path d={segments.join(" ")} fill="url(#rainbow)" />
    </svg>
  );
};
