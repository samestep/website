I've been enjoying learning about data-oriented design (DoD) lately. It's exciting to dream of a future where all our compilers are faster!

- [Sorbet](https://blog.nelhage.com/post/why-sorbet-is-fast/)
- [Carbon](https://youtu.be/ZI198eFghJk)
- [Zig](https://youtu.be/IroPQ150F6c)
- Jai (I don't have a good video link for this one)

When I mentioned some of these ideas with a friend, he asked _how much_ of a difference it actually makes to access data in cache-friendly vs cache-unfriendly ways. He's working in the more theoretical context of [streaming algorithms](https://en.wikipedia.org/wiki/Streaming_algorithm), so really he just wanted to know how justified he is in switching between "arbitrary order" and "random order" as necessary.

But I realized that, while I have some high-level intuitions, and some of those videos I've been watching give performance numbers for whole pieces of software, I don't actually know what the numbers look like for simple programs. So let's measure!

## The setup

Let's say you have an array of floating-point numbers in memory. You can add those numbers up in any order you like. Let's consider two possible orderings:

1. First to last.
2. Random.

You won't necessarily get the same answer because [floating-point addition is not associative](https://walkingrandomly.com/?p=5380); I kind of like that for this experiment because it means I can more easily trust the compiler not to do optimizations I don't expect.

To specify the order, we'll just have another array that holds integers. That way, once we've chosen the precisions for our floating-point and integer data types, we should be using the _exact same machine code_ for forward order, random order, or any other order we want. The performance should be entirely determined by _dynamic_ behavior in the CPU based on the data we're using.

<details>
<summary>Expand this to see Rust code for what we just talked about.</summary>

```rust
use std::ops::{AddAssign, Index};

use num::{Float, Num, traits::ToBytes};

trait Number: Sized + Copy + AddAssign + Num + Float + ToBytes {}

impl Number for f32 {}

impl Number for f64 {}

fn sum<T: Number, I: Copy>(floats: &[T], indices: &[I]) -> T
where
    [T]: Index<I, Output = T>,
{
    let mut total = T::zero();
    for &i in indices {
        total += floats[i];
    }
    total
}

#[test]
fn test_sum_f64_usize_not_associative() {
    let floats: &[f64] = &[0.1, 0.2, 0.3];
    let forward: &[usize] = &[0, 1, 2];
    let backward: &[usize] = &[2, 1, 0];
    assert_eq!(sum(floats, forward), 0.6000000000000001);
    assert_eq!(sum(floats, backward), 0.6);
}
```

</details>

Now all we need to do is generate some random data. For the floating-point numbers we can just use a [normal distribution](https://en.wikipedia.org/wiki/Normal_distribution), and for the integer indices we can just take the list of integers up to the length of our array, and [shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle) it to get a random order.

Or rather, that's what I thought at first. Small spoiler: further down we're going to do some experiments with arrays too big to fit in memory, and for those, Fisher–Yates turned out to be way too slow. So instead I implemented a [two-pass shuffle](https://blog.janestreet.com/how-to-shuffle-a-big-dataset/) which first partitions the array into chunks that are about a gigabyte each.

<details>
<summary>Code for generating our random data files.</summary>

```rust
use std::{
    fmt, fs,
    io::{self, Read, Seek, Write},
};

use rand::Rng;
use rand_distr::{Distribution, Normal, StandardNormal};
use tempfile::tempfile;

trait Int: TryFrom<usize, Error: fmt::Debug> + ToBytes {}

impl Int for usize {}

trait Progress {
    fn new(len: usize) -> Self;

    fn inc(&mut self);
}

impl Progress for () {
    fn new(_: usize) -> Self {}

    fn inc(&mut self) {}
}

fn random_floats<T: Number, P: Progress>(rng: &mut impl Rng, mut writer: impl Write, n: usize)
where
    StandardNormal: Distribution<T>,
{
    let mut progress = P::new(n);
    let normal = Normal::<T>::new(T::zero(), T::one()).unwrap();
    for _ in 0..n {
        let x = normal.sample(rng);
        writer.write_all(x.to_ne_bytes().as_ref()).unwrap();
        progress.inc();
    }
}

fn first_to_last<I: Int, P: Progress>(mut writer: impl Write, n: usize) {
    let mut progress = P::new(n);
    for i in 0..n {
        writer
            .write_all(I::try_from(i).unwrap().to_ne_bytes().as_ref())
            .unwrap();
        progress.inc();
    }
}

fn permutation<I: Int, P: Progress>(rng: &mut impl Rng, mut writer: impl Write, n: usize) {
    let m = (n * size_of::<I>()).div_ceil(1 << 30);
    let mut progress = P::new(2 * n);
    let mut files: Vec<fs::File> = (0..m).map(|_| tempfile().unwrap()).collect();
    {
        let mut writers: Vec<io::BufWriter<_>> = files.iter_mut().map(io::BufWriter::new).collect();
        for i in 0..n {
            let j = rng.random_range(0..m);
            writers[j]
                .write_all(I::try_from(i).unwrap().to_ne_bytes().as_ref())
                .unwrap();
            progress.inc();
        }
    }
    for mut file in files {
        let mut bytes = Vec::new();
        file.seek(io::SeekFrom::Start(0)).unwrap();
        file.read_to_end(&mut bytes).unwrap();
        let (prefix, values, suffix) = unsafe { bytes.align_to_mut::<I>() };
        assert!(prefix.is_empty());
        assert!(suffix.is_empty());
        for i in 0..values.len() {
            let j = rng.random_range(..=i);
            values.swap(i, j);
            progress.inc();
        }
        writer.write_all(&bytes).unwrap();
    }
}
```

</details>
