**tl;dr:** I want programming languages to let me write code like the following. Every language I'm aware of makes this more painful than it should be in either the function definition, or the function call, or both:

```
fn transport(
  (start: Timestamp, end: Timestamp),
  foo: Foo,
  {
    bar: Bar,
    person = { name = who: String, phone: String },
    options = { fragile: Boolean, window: HalfDay },
  },
) {
  do_stuff(who, foo);
  more_stuff(phone, end, window);
  other_things(start, fragile, bar);
}

let bar = something();
transport(
  (iso("2025-09-03T09:00:00Z"), iso("2025-09-03T11:00:00Z")),
  foo123,
  {
    bar,
    person = { name = "Alex Smith", phone = "+1 (555) 555-5555" },
    options = { fragile = true, window = HalfDay.PM },
  },
)
```

Put simply:

- I want to be able to define a function whose parameters are aggregates, and simultaneously destructure those aggregates, binding pieces of them to local values.
- I want to be able to define the function to accept parameters either positionally (i.e. like a tuple) or by name (i.e. like a record or struct) with minimal boilerplate.
- I want to be able to nest these aggregates without having to
  - come up with names for things I don't want to actually bind,
  - duplicate the names of things unnecessarily, or
  - separate the types of things from the places where I bind them.

## Comparisons

Let's compare this pseudocode to what we're forced to write in the three languages I'm most familiar with. Obviously I don't know every programming language, so if there exists one that does better than these three and checks all the boxes here (or if there's a better way to do it in one of these three languages), let me know!

### Python

The current most popular programming language does an alright job on this.

```python
from datetime import datetime
from typing import TypedDict


class Person(TypedDict):
    name: str
    phone: str


class Options(TypedDict):
    fragile: str
    window: HalfDay


def transport(
    times: tuple[datetime, datetime],
    foo: Foo,
    /,
    *,
    bar: Bar,
    person: Person,
    options: Options,
):
    start, end = times

    def inner(*, name, phone, fragile, window):
        who = name
        do_stuff(who, foo)
        more_stuff(phone, end, window)
        other_things(start, fragile, bar)

    inner(**person, **options)


bar = something()
transport(
    (iso("2025-09-03T09:00:00Z"), iso("2025-09-03T11:00:00Z")),
    foo123,
    bar=bar,
    person={"name": "Alex Smith", "phone": "+1 (555) 555-5555"},
    options={"fragile": True, "window": HalfDay.PM},
)
```

Python does let you pass function parameters either positionally or by name, without you having to do anything special. In this example I was a bit extra, using `/, *,` to _force_ everything before to be positional and everything after to be named.

Still, this Python code has some issues:

- The most minor one is that we can't destructure the `tuple` right away, so we need to make a variable name for it.
- There's no shorthand syntax to avoid writing a parameter name twice if your variable name is the same.
- While keyword arguments are great, they only really work for the outermost level of arguments to a function. This means we have to make a couple concessions:
  - We have to make names for the `Person` and `Options` types, and define their field types a bit far from their corresponding parameters in the `transport` function.
  - I'm not aware of a good way to destructure a dict unless you want to do something cursed like [`pip install dict-unpacking-at-home`](https://github.com/asottile/dict-unpacking-at-home). The best I'm aware of is this trick where you use unpacking and keyword arguments to achieve a similar result with an `inner` function. Of course, you'd have to repeat this trick for each additional layer of nesting.
  - We can't use a variable name different from the field name when destructuring.

### TypeScript

This one is definitely the closest to the pseudocode I wrote at the top.

```typescript
function transport(
  [start, end]: [Timestamp, Timestamp],
  foo: Foo,
  {
    bar,
    person: { name: who, phone },
    options: { fragile, window },
  }: {
    bar: Bar;
    person: { name: string; phone: string };
    options: { fragile: boolean; window: HalfDay };
  },
) {
  doStuff(who, foo);
  moreStuff(phone, end, window);
  otherThings(start, fragile, bar);
}

let bar = something();
transport([iso("2025-09-03T09:00:00Z"), iso("2025-09-03T11:00:00Z")], foo123, {
  bar,
  person: { name: "Alex Smith", phone: "+1 (555) 555-5555" },
  options: { fragile: true, window: HalfDay.PM },
});
```

The only issue here is locality. Rather than being able to write the types for the fields and tuple elements next to the names we use for destructuring, we have to write them separately and duplicate all the field names.

### Rust

This one is the worst of the three in my opinion, which is sad because Rust is currently my favorite programming language.

```rust
use std::time::Instant;

struct Person<'a> {
    name: &'a str,
    phone: &'a str,
}

struct Options {
    fragile: bool,
    window: HalfDay,
}

struct Args {
    bar: Bar,
    person: Person,
    options: Options,
}

fn transport(
    (start, end): (Instant, Instant),
    foo: Foo,
    Args {
        bar,
        person: Person { name: who, phone },
        options: Options { fragile, window },
    }: Args,
) {
    do_stuff(who, foo);
    more_stuff(phone, end, window);
    other_things(start, fragile, bar);
}

fn main() {
    let bar = something();
    transport(
        (iso("2025-09-03T09:00:00Z"), iso("2025-09-03T11:00:00Z")),
        foo123,
        Args {
            bar,
            person: Person {
                name: "Alex Smith",
                phone: "+1 (555) 555-5555",
            },
            options: Options {
                fragile: true,
                window: HalfDay::PM,
            },
        },
    )
}
```

Rust doesn't have _either_ [keyword arguments as a first-class concept](https://github.com/rust-lang/rfcs/issues/323) like Python _or_ [anonymous struct types](https://github.com/rust-lang/rfcs/pull/2584) like TypeScript. And unlike other systems languages like C++ or Zig, you can't omit the type name in a struct literal at the call site, so calls to functions using an approach like this in Rust are just too verbose.

Because passing named arguments like this in Rust is so inconvenient, it's very common to just use positional arguments instead. The Rust culture of using nice specific types can help prevent accidentally mixing up arguments if all a function's argument types are different, but if some of them are the same type, it's just error-prone. For instance, in the `wasm-encoder` crate, the [old `Instruction` API for `memory.copy`](https://docs.rs/wasm-encoder/0.238.1/wasm_encoder/enum.Instruction.html#variant.MemoryCopy) names the `src_mem` and `dst_mem` fields so you can easily see which is which at the call site; but the [new `InstructionSink` API](https://docs.rs/wasm-encoder/0.238.1/wasm_encoder/struct.InstructionSink.html#method.memory_copy) just uses positional arguments so you'd have to hover over the `memory_copy` memory name to see which is which. (Full disclosure: [I wrote the new API](https://github.com/bytecodealliance/wasm-tools/pull/1985) and this was a point of discussion before it got merged.)

Yes, I know that rust-analyzer shows parameter names as inlay hints by default. No, I do not have inlay hints enabled. In my opinion, they make code harder to read by causing things to visually spill past the rustfmt column limit.

## Representation

OK, so how might one implement this? I'll leave an actual parser as an exercise for the reader (although if you're curious, here's a [link to one I prototyped in the past](https://github.com/gradbench/gradbench/blob/2f8b13ac4a65be3a71641d7d9c43d890ecf0a4f9/crates/adroit/src/parse.rs)), but let's at least look at how one might represent it at the AST level.

### Standard

Using TypeScript type definitions, here is how we might represent a simplified AST for a subset of legal TypeScript function signatures:

```typescript
type TypeField = {
  name: string;
  type: Type;
};

type Type =
  | { kind: "name"; name: string }
  | { kind: "tuple"; elements: Type[] }
  | { kind: "record"; fields: TypeField[] };

type BindingField = {
  name: string;
  binding?: Binding;
};

type Binding =
  | { kind: "name"; name: string }
  | { kind: "tuple"; elements: Binding[] }
  | { kind: "record"; fields: BindingField[] };

type Parameter = {
  binding: Binding;
  type: Type;
};

type FunctionSignature = {
  parameters: Parameter[];
  result?: Type;
};
```

As you can see, `Type` and `Binding` are both recursive types, but they're completely separate from each other. Then the `Parameter` type bundles together one of each.

<details>
<summary>Expand this to see what the earlier TypeScript example would look like using those AST types.</summary>

```javascript
{
  parameters: [
    {
      binding: {
        kind: "tuple",
        elements: [
          { kind: "name", name: "start" },
          { kind: "name", name: "end" },
        ],
      },
      type: {
        kind: "tuple",
        elements: [
          { kind: "name", name: "Timestamp" },
          { kind: "name", name: "Timestamp" },
        ],
      },
    },
    {
      binding: { kind: "name", name: "foo" },
      type: { kind: "name", name: "Foo" },
    },
    {
      binding: {
        kind: "record",
        fields: [
          { name: "bar" },
          {
            name: "person",
            binding: {
              kind: "record",
              fields: [
                { name: "name", binding: { kind: "name", name: "who" } },
                { name: "phone" },
              ],
            },
          },
          {
            name: "options",
            binding: {
              kind: "record",
              fields: [{ name: "fragile" }, { name: "window" }],
            },
          },
        ],
      },
      type: {
        kind: "record",
        fields: [
          { name: "bar", type: { kind: "name", name: "Bar" } },
          {
            name: "person",
            type: {
              kind: "record",
              fields: [
                { name: "name", type: { kind: "name", name: "string" } },
                { name: "phone", type: { kind: "name", name: "string" } },
              ],
            },
          },
          {
            name: "options",
            type: {
              kind: "record",
              fields: [
                { name: "fragile", type: { kind: "name", name: "Boolean" } },
                { name: "window", type: { kind: "name", name: "HalfDay" } },
              ],
            },
          },
        ],
      },
    },
  ],
}
```

</details>

### Proposal

Here's how I'd instead represent parameters and binding forms in the AST:

```typescript
type TypeField = {
  name: string;
  type: Type;
};

type Type =
  | { kind: "name"; name: string }
  | { kind: "tuple"; elements: Type[] }
  | { kind: "record"; fields: TypeField[] };

type BindingField = {
  name: string;
  parameter: Parameter;
};

type Binding =
  | { kind: "name"; name: string }
  | { kind: "tuple"; elements: Parameter[] }
  | { kind: "record"; fields: BindingField[] };

type Parameter = {
  binding: Binding;
  type?: Type;
};

type FunctionSignature = {
  parameter: Parameter;
  result?: Type;
};
```

We've kept `Type` (and its helper `TypeField`) exactly the same. There are only three differences:

- We've replaced `Binding` with `Parameter` in the `"tuple"` and `"record"` cases for `Binding`, to allow types to be written intermingled with destructuring.
- We've made the `type` field optional on `Parameter`, to avoid forcing types to be duplicated.
- We've changed the `FunctionSignature` to just have one `Parameter` instead of a `Parameter[]` list, because our ability to handle nesting means a parameter list is naturally handled like any other tuple.

That last one is probably a bit too cheeky, since it makes things weird by having a function's parameter list be a tuple _unless_ that tuple would have only have one element and there's no trailing comma. So in a real-world imperative language you'd probably want to keep it as an explicit `Parameter[]` list. But in a functional language, you might actually want to just use a single `Parameter`; or have a `Parameter[]` list but use that for currying instead of tuples, as is tradition.

<details>
<summary>Expand this to see what the original pseudocode example would look like using these alternative AST types.</summary>

```javascript
{
  parameter: {
    binding: {
      kind: "tuple",
      elements: [
        {
          binding: {
            kind: "tuple",
            elements: [
              {
                binding: { kind: "name", name: "start" },
                type: { kind: "name", name: "Timestamp" },
              },
              {
                binding: { kind: "name", name: "end" },
                type: { kind: "name", name: "Timestamp" },
              },
            ],
          },
        },
        {
          binding: { kind: "name", name: "foo" },
          type: { kind: "name", name: "Foo" },
        },
        {
          binding: {
            kind: "record",
            fields: [
              {
                name: "bar",
                parameter: {
                  binding: { kind: "name", name: "bar" },
                  type: { kind: "name", name: "Bar" },
                },
              },
              {
                name: "person",
                parameter: {
                  binding: {
                    kind: "record",
                    fields: [
                      {
                        name: "name",
                        parameter: {
                          binding: { kind: "name", name: "who" },
                          type: { kind: "name", name: "String" },
                        },
                      },
                      {
                        name: "phone",
                        parameter: {
                          binding: { kind: "name", name: "phone" },
                          type: { kind: "name", name: "String" },
                        },
                      },
                    ],
                  },
                },
              },
              {
                name: "options",
                parameter: {
                  binding: {
                    kind: "record",
                    fields: [
                      {
                        name: "fragile",
                        parameter: {
                          binding: { kind: "name", name: "fragile" },
                          type: { kind: "name", name: "Boolean" },
                        },
                      },
                      {
                        name: "window",
                        parameter: {
                          binding: { kind: "name", name: "window" },
                          type: { kind: "name", name: "HalfDay" },
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      ],
    },
  },
}
```

</details>

One quirk you can see here is that, for the common case where we bind a record field to a local with the same name, we only write the name once in the source program, but that name still ends up duplicated in the AST. I don't think this is really an issue, but if you want then you could avoid it by just inlining the definition of `Parameter` into the `BindingField` type and then making the `binding` optional there. I just didn't do that here because it'd make the AST types a bit less clean.

### Checking

This _does_ make typechecking a bit more complicated. For instance, what if someone writes code like this?

```
fn foo((x: A, y: B): (C, D)) {}
```

The typechecker [needs to unify](https://github.com/gradbench/gradbench/blob/2f8b13ac4a65be3a71641d7d9c43d890ecf0a4f9/crates/adroit/src/typecheck/mod.rs#L916-L920) the type it infers from `binding` with the explicitly provided `type`, if there is one. And if they don't match, it needs to [report an error](https://github.com/gradbench/gradbench/blob/2f8b13ac4a65be3a71641d7d9c43d890ecf0a4f9/crates/adroit/src/typecheck/errors/bind_disagree.adroit).

Also, languages like Rust enforce the property that every top-level function declaration needs to provide a fully-typed signature. In my prototype I implemented this by just [adding a `strict: bool` flag](https://github.com/gradbench/gradbench/blob/2f8b13ac4a65be3a71641d7d9c43d890ecf0a4f9/crates/adroit/src/typecheck/mod.rs#L864-L876) to the function for typechecking parameters; not sure if there's a better way in general.

## Conclusion

Some final notes just to clarify things a bit more:

- While the example I showed at the top destructures _everything_ and always colocates types with bindings, this syntax doesn't force you to do that. You can still keep types separate if you want, and/or replace `=` with `:` to just destructure part and then use dot syntax to access specific fields later. Whichever you prefer.

  ```
  fn transport(
    (start, end): (Timestamp, Timestamp),
    foo: Foo,
    {
      bar: Bar,
      person: { name: String, phone: String },
      options: { fragile: Boolean, window: HalfDay },
    },
  ) {
    do_stuff(person.name, foo);
    more_stuff(person.phone, end, options.window);
    other_things(start, options.fragile, bar);
  }
  ```

- This syntax isn't limited to function parameters; I think it makes sense to just replace `Binding` with `Parameter` pretty much everywhere. So, instead of this:

  ```typescript
  type Statement =
    | { kind: "expression"; expression: Expression }
    /* ... */
    | {
        kind: "let";
        binding: Binding;
        type?: Type;
        expression: Expression;
      };
  ```

  You'd do this:

  ```typescript
  type Statement =
    | { kind: "expression"; expression: Expression }
    /* ... */
    | {
        kind: "let";
        parameter: Parameter;
        expression: Expression;
      };
  ```

  And that lets you write `let` bindings in any of these styles:

  ```
  let (x, y): (Foo, Bar) = baz();
  let (x, y) = baz();
  let (x: Foo, y: Bar) = baz();
  let x: Foo, y: Bar = baz();
  let x, y = baz();
  ```

Thanks for reading!
