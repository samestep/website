# My website

To develop locally, install [Bun][] and `fs-swap`:

```sh
cargo install --git https://github.com/samestep/fs-swap --branch bin
```

Then run these commands:

```sh
bun install
bun run watch
```

And in a separate terminal:

```sh
bun run serve
```

[bun]: https://bun.sh/
