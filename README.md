# My website

To develop locally, run these commands in the dev shell provided by `flake.nix`:

```sh
bun install
bun --watch run watch.ts
```

Then in a separate terminal, also using the dev shell:

```sh
bun run serve
```

Alternatively, to start a hot-reload server for an individual blog post, use the `serve.tsx` script and pass the `--post` name as a command-line argument.
