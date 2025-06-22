You may know that, because your computer has different caches (L1, L2, L3...), and memory operations operate on cache lines of about 64 bytes each, you should write programs that exhibit [locality](https://en.wikipedia.org/wiki/Locality_of_reference) to get maximum performance.

{{caches}}

(Disk not shown, of course.)

But **how well** do you understand this idea? For instance, let's say you have an array of floating-point numbers, and an array of all the indices of the first array. You have a program that adds up the numbers from the first array in the order given by the second array. So, for this example, we'd add `ε + α + δ + ζ + β + γ` in that order:

{{arrays}}

Let's just consider the two cases where the indices are in **first-to-last order** or in **random order**. Before I wrote this post, I couldn't answer any of the following questions:

1. How big of an array do you need before you see a difference in performance between the two orderings?
2. How much time does the first-to-last ordering take per element, on average?
3. How much slower is random order than first-to-last order for arrays that fit in RAM?
4. How much slower is random order than first-to-last order for arrays that don't fit in RAM?
5. To construct these shuffled index arrays for the random ordering, is standard Fisher-Yates sufficient?
6. How much slower is first-to-last order for arrays that don't fit in RAM, when using memory-mapped files?
7. Are memory-mapped files as fast as you can get?

If you already know the answers to all these questions, sweet! Otherwise, make your guesses and check them when you reach the bottom of this post :)

## Setup

All the code to reproduce the measurements in this blog post can be found in a [supplementary GitHub repository](https://github.com/samestep/random-access/tree/9039b4297d19b10dedfc85edf438db35bcf3f863).

Because the indices are just stored in an array, they should use the _exact same machine code_ for both first-to-last order and random order, we've chosen the precisions for our floating-point and integer data types. That means the performance should be entirely determined by _dynamic_ behavior in the CPU based on the data we're using, along with other dynamic behavior by the operating system (we'll get to that later).

<details>
<summary>Expand this to see some Rust code.</summary>

```rust
use std::ops::{AddAssign, Index};

use num::{Float, Num, traits::ToBytes};

trait Number: Sized + Copy + Into<f64> + AddAssign + Num + Float + ToBytes {}

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

Now we need to generate some random data. For the floating-point numbers we can just use a [normal distribution](https://en.wikipedia.org/wiki/Normal_distribution), and for the integer indices we can just take the list of integers up to the length of our array, and [shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle) it to get a random order.

Or rather, that's what I thought at first. Small spoiler: further down we're going to do some experiments with arrays too big to fit in memory, and for those, Fisher-Yates turned out to be way too slow. So instead I implemented a [two-pass shuffle](https://blog.janestreet.com/how-to-shuffle-a-big-dataset/) which first partitions the array into chunks that are about a gigabyte each.

<details>
<summary>Code to generate our random data.</summary>

```rust
use std::{
    fmt, fs,
    io::{self, Read, Seek, Write},
};

use rand::Rng;
use rand_distr::{Distribution, Normal, StandardNormal};
use tempfile::tempfile;

trait Int: TryFrom<usize, Error: fmt::Debug> + ToBytes {}

impl Int for u32 {}

impl Int for u64 {}

trait Progress {
    fn new(len: usize) -> Self;

    fn step(&mut self);
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
        progress.step();
    }
}

fn first_to_last<I: Int, P: Progress>(mut writer: impl Write, n: usize) {
    let mut progress = P::new(n);
    for i in 0..n {
        writer
            .write_all(I::try_from(i).unwrap().to_ne_bytes().as_ref())
            .unwrap();
        progress.step();
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
            progress.step();
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
            progress.step();
        }
        writer.write_all(&bytes).unwrap();
    }
}
```

</details>

Next we just need to use this to make a bunch of files with data of different sizes. We'll just do all the powers of two up whatever fits comfortably on our SSD.

<details>
<summary>Code for bulk data generation into files.</summary>

```rust
use std::{ops::RangeInclusive, path::Path};

use indicatif::ProgressBar;
use rand::SeedableRng;

impl Progress for ProgressBar {
    fn new(len: usize) -> Self {
        let bar = ProgressBar::new(len as u64);
        bar.set_position(0);
        bar
    }

    fn step(&mut self) {
        self.inc(1);
    }
}

fn make_rng(seed: u64) -> impl Rng {
    rand_pcg::Pcg64Mcg::seed_from_u64(seed)
}

fn generate_file(dir_name: &str, file_name: &str, f: impl FnOnce(io::BufWriter<fs::File>)) {
    let dir = Path::new(dir_name);
    let path = dir.join(file_name);
    println!("generating {}", path.display());
    fs::create_dir_all(dir).unwrap();
    f(io::BufWriter::new(fs::File::create(path).unwrap()));
}

struct Options {
    f32: bool,
    f64: bool,
    u32: bool,
    u64: bool,
}

const FLOAT32: &str = "float32";
const FLOAT64: &str = "float64";
const UNSHUFFLED32: &str = "unshuffled32";
const SHUFFLED32: &str = "shuffled32";
const UNSHUFFLED64: &str = "unshuffled64";
const SHUFFLED64: &str = "shuffled64";

fn generate(exponents: RangeInclusive<usize>, options: Options) {
    for exponent in exponents {
        let n = 1 << exponent;
        let name = format!("{exponent}.dat");
        if options.f32 {
            generate_file(FLOAT32, &name, |writer| {
                random_floats::<f32, ProgressBar>(&mut make_rng(0), writer, n);
            });
        }
        if options.f64 {
            generate_file(FLOAT64, &name, |writer| {
                random_floats::<f64, ProgressBar>(&mut make_rng(1), writer, n);
            });
        }
        if options.u32 {
            generate_file(UNSHUFFLED32, &name, |writer| {
                first_to_last::<u32, ProgressBar>(writer, n);
            });
            generate_file(SHUFFLED32, &name, |writer| {
                permutation::<u32, ProgressBar>(&mut make_rng(2), writer, n);
            });
        }
        if options.u64 {
            generate_file(UNSHUFFLED64, &name, |writer| {
                first_to_last::<u64, ProgressBar>(writer, n);
            });
            generate_file(SHUFFLED64, &name, |writer| {
                permutation::<u64, ProgressBar>(&mut make_rng(3), writer, n);
            });
        }
    }
}
```

</details>

## Results

Alrighty, now that we have all these files, let's run our code on them!

<details>
<summary>Code to calculate sums of our generated data.</summary>

```rust
use std::time::Instant;

use serde::Serialize;

trait Reader: AsRef<[u8]> {
    fn new(path: &Path) -> Self;
}

impl Reader for Vec<u8> {
    fn new(path: &Path) -> Self {
        fs::read(path).unwrap()
    }
}

#[derive(Serialize)]
struct Measurement<'a> {
    floats: &'a str,
    indices: &'a str,
    exponent: usize,
    iteration: usize,
    output: f64,
    seconds: f64,
}

#[derive(Clone, Copy)]
struct Index32(u32);

#[derive(Clone, Copy)]
struct Index64(u64);

impl<T> Index<Index32> for [T] {
    type Output = T;

    fn index(&self, index: Index32) -> &Self::Output {
        unsafe { self.get_unchecked(index.0 as usize) }
    }
}

impl<T> Index<Index64> for [T] {
    type Output = T;

    fn index(&self, index: Index64) -> &Self::Output {
        unsafe { self.get_unchecked(index.0 as usize) }
    }
}

unsafe fn reinterpret<T>(bytes: &[u8]) -> &[T] {
    let (prefix, values, suffix) = unsafe { bytes.align_to::<T>() };
    assert!(prefix.is_empty());
    assert!(suffix.is_empty());
    values
}

fn measure_files<R: Reader, T: Number, I: Copy>(
    dir_floats: &str,
    dir_indices: &str,
    exponent: usize,
    repeat: usize,
) where
    [T]: Index<I, Output = T>,
{
    let name = format!("{exponent}.dat");
    let bytes_floats = R::new(&Path::new(dir_floats).join(&name));
    let bytes_indices = R::new(&Path::new(dir_indices).join(&name));
    let floats = unsafe { reinterpret::<T>(bytes_floats.as_ref()) };
    let indices = unsafe { reinterpret::<I>(bytes_indices.as_ref()) };
    for iteration in 0..repeat {
        let start = Instant::now();
        let total = sum(floats, indices);
        let duration = start.elapsed();
        let measurement = Measurement {
            floats: dir_floats,
            indices: dir_indices,
            exponent,
            iteration,
            output: total.into(),
            seconds: duration.as_secs_f64(),
        };
        println!("{}", serde_json::to_string(&measurement).unwrap());
    }
}

fn measure<R: Reader>(exponents: RangeInclusive<usize>, options: Options, repeat: usize) {
    for exponent in exponents {
        if options.f32 {
            if options.u32 {
                measure_files::<R, f32, Index32>(FLOAT32, UNSHUFFLED32, exponent, repeat);
                measure_files::<R, f32, Index32>(FLOAT32, SHUFFLED32, exponent, repeat);
            }
            if options.u64 {
                measure_files::<R, f32, Index64>(FLOAT32, UNSHUFFLED64, exponent, repeat);
                measure_files::<R, f32, Index64>(FLOAT32, SHUFFLED64, exponent, repeat);
            }
        }
        if options.f64 {
            if options.u32 {
                measure_files::<R, f64, Index32>(FLOAT64, UNSHUFFLED32, exponent, repeat);
                measure_files::<R, f64, Index32>(FLOAT64, SHUFFLED32, exponent, repeat);
            }
            if options.u64 {
                measure_files::<R, f64, Index64>(FLOAT64, UNSHUFFLED64, exponent, repeat);
                measure_files::<R, f64, Index64>(FLOAT64, SHUFFLED64, exponent, repeat);
            }
        }
    }
}
```

</details>

I ran these experiments on two different machines:

- A 2020 MacBook Pro with M1 chip, 16 GiB of RAM, and a 1 TB SSD.
- A Linux desktop with an AMD Ryzen 5 3600X, 24 GiB of Corsair Vengeance LPX DDR4 3000MHz DRAM, and a Western Digital 1 TB 3D NAND SATA SSD.

For each data point (given a choice of floating-point type and integer type, and an array size), I ran the summation at least ten times (up to a hundred times for some of the smaller arrays), dropped the first two (while caches were still warming up), and computed the mean of the remaining times.

### MacBook

{{macbook}}

Note that both the $x$-axis and the $y$-axis are on a log scale. As you can see, it levels out at about a nanosecond per element on average, until the array of floating-point numbers becomes too large to fit in the system-level cache (SLC), which is 8 MiB. Then first-to-last order stays the same, but random order goes up to about four nanoseconds. Finally, when the arrays become too large to fit in RAM, both times shoot up; more on that later.

### Linux desktop

{{desktop}}

A bit noisier data for those smaller arrays! Looks like first-to-last order is actually only about half a nanosecond per element on this CPU. But even though this L3 cache is 32 MiB, random order starts to become slower when the floating-point array is bigger than 4 MiB; not sure why. The ratio here is starker here, ranging from four to about eight nanoseconds per element after divergence from the first-to-last curve.

Just like the MacBook, there's a huge spike when there's to much to fit everything in RAM, but the interesting difference here is that random-order performance starts to degrade sharply even before reaching that point, while first-to-last order stays relatively stable. Even though I have 24 GiB of RAM, floating-point arrays over a gigabyte in size start to reach twenty or thirty nanoseconds per element.

## Memory mapping

After running the above, I wasn't sure whether the spike in the right-hand part of the graph was just because I was trying to read the _entire_ file into memory before doing any work. Here are some results using [memory-mapped files](https://en.wikipedia.org/wiki/Memory-mapped_file) instead. To my disappointment, though, the results look more or less the same (although at least this time it didn't freeze up my computer on the really big arrays).

<details>
<summary>Code to memory-map files.</summary>

```rust
use memmap2::Mmap;

impl Reader for Mmap {
    fn new(path: &Path) -> Self {
        unsafe { Mmap::map(&fs::File::open(path).unwrap()) }.unwrap()
    }
}
```

</details>

### MacBook

{{macbookMmap}}

Looks pretty much the same as before, but this time we were able to run it on bigger inputs. As you can see, for large enough arrays, shuffling the indices seems to have basically no effect on performance; both approaches end up taking over twenty nanoseconds per element on average. I wonder if this is a macOS-specific phenomenon.

### Linux desktop

{{desktopMmap}}

Not much new to see here. Still, it is interesting that performance for random order seems to degrade much more gradually than performance for first-to-last order; the latter pretty look almost like a step function after reaching a billion elements.

## "Direct" summation

Just one last experiment, I swear! I was still curious how much of the performance cliff for large arrays was simply due to memory bandwidth versus SSD bandwidth, and how much was due to how the operating system handles memory-mapped files. So I tried a separate implementation that just reads the file of floating-point numbers a chunk at a time, sums up that chunk, then moves to the next chunk.

<details>
<summary>Code to sum more directly from a file.</summary>

```rust
use std::io::BufRead;

fn sum_buffered<T: Number>(dir_floats: &str, exponent: usize, repeat: usize) {
    let name = format!("{exponent}.dat");
    for iteration in 0..repeat {
        let mut reader =
            io::BufReader::new(fs::File::open(Path::new(dir_floats).join(&name)).unwrap());
        let start = Instant::now();
        let mut total = T::zero();
        loop {
            let buffer = reader.fill_buf().unwrap();
            if buffer.is_empty() {
                break;
            }
            let floats = unsafe { reinterpret::<T>(buffer) };
            for &float in floats {
                total += float;
            }
            let bytes = buffer.len();
            reader.consume(bytes);
        }
        let duration = start.elapsed();
        let measurement = Measurement {
            floats: dir_floats,
            indices: "unshuffled64",
            exponent,
            iteration,
            output: total.into(),
            seconds: duration.as_secs_f64(),
        };
        println!("{}", serde_json::to_string(&measurement).unwrap());
    }
}

fn measure_buffered(exponents: RangeInclusive<usize>, options: Options, repeat: usize) {
    for exponent in exponents {
        if options.f32 {
            sum_buffered::<f32>(FLOAT32, exponent, repeat);
        }
        if options.f64 {
            sum_buffered::<f64>(FLOAT64, exponent, repeat);
        }
    }
}
```

</details>

Note that this is not an apples-to-apples comparison like the above experiments were, since it uses a completely different implementation to compute the sum. That's why I put it here in its own section.

### MacBook

{{macbookBuffer}}

This pretty much confirms my suspicion: it looks like memory-mapping was just not being very smart. Even if you doubled these times, you'd still only end up with a few nanoseconds per element on average, which is much faster than the over twenty nanoseconds per element we were seeing earlier for larger arrays.

### Linux desktop

{{desktopBuffer}}

A very different story on Linux! These numbers actually look pretty comparable to what we were seeing earlier, especially once you double them to account for the fact that here we only need to read one file instead of two. My best guess is that the SSD I have for my Linux machine has lower bandwidth than my MacBook SSD, but the Linux operating system handles memory-mapped files more intelligently than macOS does. Hard to say for sure without trying the same experiment with different operating systems on the same hardware, though.

## Conclusion

And there you have it! Here are the answers we learned for the questions posed at the start of the post:

1. Summing numbers is fairly memory-bound, so there's basically no difference for arrays smaller than a million elements (the size of a typical L3 cache). On my Linux machine, though, there doesn't seem to be a direct correspondence between this cutoff point and the actual L3 cache size.
2. In first-to-last order, the average time per element levels out to about a nanosecond on my MacBook, or about half a nanosecond on my Linux desktop.
3. For arrays too big for the L3 cache but under about a gigabyte, random order is about 4x slower on my MacBook, and about 8-16x slower on my Linux desktop.
4. On Linux, random order starts getting even slower for arrays over a gigabyte, becoming more than 50x slower than first-to-last order; in contrast, random order on the MacBook seems to just level out as long as everything fits in RAM.
5. Fisher-Yates is way too slow for data too big to fit in memory! Use a two-pass shuffle instead.
6. Memory-mapped files are not magic: for data too big to fit in RAM, first-to-last order finally gets slower, by about 20x. After this point, random order still seems to be slower on Linux, but seems about the same speed as first-to-last order on the MacBook.
7. Interestingly, while that effect stays when switching to a more direct approach on Linux, it seems to magically go away on macOS; perhaps due to a difference in how the two OSes handle memory-mapped files?

Let me know if I got anything wrong! And I hope you enjoyed.
