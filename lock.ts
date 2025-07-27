declare global {
  var version: number;
}

globalThis.version ??= 0;

export const println = async (f: () => Promise<unknown>) => {
  const v = ++globalThis.version;
  const s = await f();
  if (globalThis.version === v) console.log(JSON.stringify(s));
};
