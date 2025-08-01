- Incremental parsers:
  - [Tree-sitter](https://tree-sitter.github.io/tree-sitter/)
  - [Lezer](https://lezer.codemirror.net/)
- Industrial parsers:
  - rust-analyzer
  - Zig
  - Carbon
- Parsers to write:
  - C-like syntax for Wasm
    - Test by roundtripping Wasm
- Things to link to:
  - [2018 VS Code text buffer reimplementation](https://code.visualstudio.com/blogs/2018/03/23/text-buffer-reimplementation)
  - [Flattening ASTs](https://www.cs.cornell.edu/~asampson/blog/flattening.html)
  - [Carbon compiler talk](https://youtu.be/ZI198eFghJk)
  - [Zig compiler talk](https://youtu.be/IroPQ150F6c)
- Questions:
  - How big does the file need to be for incremental parsing to be faster?
  - What underlying text data structure should be used to serve incremental parsing best?
  - How hard is it to write a faster parser by hand?
  - How hard is it to give good error messages in both cases?
  - How fast are the various parser generators for Rust?
  - Does either approach affect speed of code consuming the AST?
  - How fast is each approach for syntax highlighting specifically?
