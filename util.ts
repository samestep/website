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

// TypeScript doesn't like this dynamic import situation so we're putting it in
// its own function to isolate the fact that we're ignoring the type error.
/** Import a file in this repository as text. */
export const importText = async (path: string): Promise<string> =>
  // @ts-ignore
  (await import(`./${path}`, { with: { type: "text" } })).default as string;
