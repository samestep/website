/** `lo` is inclusive, `hi` is exclusive. */
export const range = (lo: number, hi: number): number[] => {
  const array = [];
  for (let i = lo; i < hi; ++i) array.push(i);
  return array;
};

/** Just like Python. */
export const splitlines = (s: string): string[] => {
  const lines = s.split(/\n/);
  let n = lines.length;
  if (n > 0 && lines[n - 1] === "") lines.pop();
  return lines;
};
