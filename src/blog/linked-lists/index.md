This is a followup to my previous post titled ["How much slower is random access, really?"](/blog/random-access/) which to my surprise, ended up getting some attention [on Hacker News](https://news.ycombinator.com/item?id=44356385). Here is the top comment (as of today), by @andersa:

> Note this is not true random access in the manner it occurs in most programs. By having a contiguous array of indices to look at, that array can be prefetched as it goes, and speculative execution will take care of loading many upcoming indices of the target array in parallel.
>
> A more interesting example might be if each slot in the target array has the next index to go to in addition to the value, then you will introduce a dependency chain preventing this from happening.

A great point! Let's do it. I have a shorter list of questions this time:

1. Compared to the original two separate arrays, how much slower is iterating over these pairs in first-to-last layout?
2. Compared to the original two separate arrays, how much slower is iterating over these pairs in random layout?

I'm also not going to bother with arrays too big for RAM.

Before running these new experiments, my guess was that they'd both be about 2x slower on linked lists compared to separate arrays. As a brief recap, that would mean _roughly_ 2ns per list element in any layout except _roughly_ 8-16ns per element in random layout for lists with more than a million elements.

<details>
<summary>Spoiler...</summary>

I was pretty much exactly right for question 1! **But _very wrong_ for question 2.**

</details>

## Setup

As a recap, previously we had **two arrays**, one holding indices (shown on the top), and the other holding the actual numbers we want to sum:

{{arrays}}

in contrast, this time ...

<details>
<summary>Expand this to see the core of the Rust code.</summary>

```rust
use std::{fmt, ops::AddAssign};

use num::{Float, Num};

trait Number: Sized + Copy + Into<f64> + AddAssign + Num + Float {}

impl Number for f32 {}

impl Number for f64 {}

trait Int: Copy + TryFrom<usize, Error: fmt::Debug> + Num {
    fn to_usize(self) -> usize;
}

impl Int for u32 {
    fn to_usize(self) -> usize {
        self as usize
    }
}

impl Int for u64 {
    fn to_usize(self) -> usize {
        self as usize
    }
}

fn sum_pairs<T: Number, I: Int>(pairs: &[(T, I)]) -> T {
    let mut total = T::zero();
    let mut i = I::zero();
    loop {
        match pairs.get(i.to_usize()) {
            Some(&(x, j)) => {
                total += x;
                i = j;
            }
            None => return total,
        }
    }
}
```

</details>

## Results

I'm running these experiments on the same two machines as before:

- A 2020 MacBook Pro with M1 chip, 16 GiB of RAM, and a 1 TB SSD.
- A Linux desktop with an AMD Ryzen 5 3600X, 24 GiB of Corsair Vengeance LPX DDR4 3000MHz DRAM, and a Western Digital 1 TB 3D NAND SATA SSD.

A different HN commenter (@archi42) noted that 24 GiB is a bit of a weird amount of RAM, and I responded that it's because I originally had four 8 GiB RAM sticks, but one stopped working so I removed it a while ago. They suggested that may be a cause of some of my weird data for larger arrays on Linux:

> I'm not deep into the details of the AMD DRAM controller, but this detail could cause some of your anomalies. If this was an academic paper, the findings would be borderline invalid. You might want to remove the extra module and run the benchmarks again.

I did not end up doing that for this post, and as you'll see, it does not affect the high-level takeaway.

### MacBook

{{macbook}}

So uh... yeah. Not even close to before. I mean, the first-to-last layout does level out to 2ns per element as I predicted! But random layout is _way_ slower for linked lists. Here you can actually see the distinction between L1 cache, L2 cache, and RAM pretty clearly:

- For linked lists that fit in the _L1 cache_, random layout is **not discernably slower** than first-to-last.
- For linked lists that fit in the _L2 cache_, random layout is **about 3x slower** than first-to-last.
- For linked lists that _don't fit in cache_, random layout is **about 50x slower** than first-to-last.

### Linux desktop

{{desktop}}

## Conclusion

Really I should have done this experiment earlier. Anyways, returning back to our two research questions (recall that the specific questions referred to experiments from [the original post](/blog/random-access/)):

1. If the nodes of a linked list are laid out in first-to-last order, summing over the list is about 2x slower than summing over an array using a separate array of indices in first-to-last order.
2. If the nodes of a linked list are laid out in random order, summing over the list is significantly slower than summing over an array using an index array in random order:
   - If everything fits in the L2 cache, a linked list is **about 3x slower** than two arrays.
   - If everything does not fit in cache, a linked list is **about 15x slower** than two arrays.

Like before, I hope you enjoyed, and please let me know if I made any mistakes!
