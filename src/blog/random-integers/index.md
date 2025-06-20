If you [type "roll a die" into Google][google die], it... well, it rolls a die:

![Google "roll a die"](assets/die.png)

But how does it do that?

To start: you may have heard that computers use binary numbers. That's true! This has been well-explained by many other people, so if you're unfamiliar, check out one of those explanations, e.g. [Khan Academy][binary].

_(6 minutes later)_ Welcome back! So yeah, every digit of every number in your computer is either a 0 or a 1. Kind of like when you flip a coin, it's either heads or tails. ([Or edge][three-sided coin], but that's a different post entirely.) Let's talk about coin flips, then!

## Coin flips

You can also [Google "flip a coin"][google coin]:

![Google "flip a coin"](assets/coin.png)

This is much closer to the computer's native tongue. All it has to do is generate a single random bit. For the remainder of this post, we're going to take "generate a random bit" (or equivalently, "flip a coin") as a basic primitive, and then build everything else on top of that.

Let's say we want to simulate a die roll but all we have is a coin to flip. How can we give each number on the die an equal chance? Well, we can start by flipping the coin once. This at least lets us narrow down the possibilities:

- If we got **heads**, we'll say that the die roll is even: **2**, **4**, or **6**.
- If we got **tails**, we'll say that the die roll is odd: **1**, **3**, or **5**.

Either way we have 3 possibilities left. Now we're kinda stuck. If we flip the coin again, how do we choose what to do? Let's say our first flip was heads, so our choices are **2**, **4**, or **6**. We could say:

- If we get **heads** again, we'll say the die roll is **2**.
- If we get **tails**, we'll say the die roll is **4** or **6**.

And then if we got tails, we need to flip a third time to choose between **4** and **6**. But this is _not_ a fair die roll! We're twice as likely to get **2** as we are to get **4**, and similarly we're twice as likely to get **2** as **6**. What are we to do?

{{histogramNaive}}

## Python!

Let's look at how real computers do it. If you have [the snake language][python] installed, it's pretty straightforward to use the [builtin `random` module][python random] to simulate rolling a die:

```
$ python
>>> import random
>>> random.randint(1, 6)
5
>>> random.randint(1, 6)
2
```

Now, you and I may have different ideas of fun, but I always enjoy doing a little deep dive of the source code for other people's software that I'm running. [How is `randint` defined?][python randint toplevel]

```python
randint = _inst.randint
```

[Alright.][python inst]

```python
_inst = Random()
```

So [that means:][python randint]

```python
def randint(self, a, b):
    """Return random integer in range [a, b], including both end points.
    """

    return self.randrange(a, b+1)
```

Fair enough: to generate a random integer between 1 and 6 (inclusive), that's the same as generating a random integer between 1 (inclusive) and 7 (exclusive). If you look at the [source for `randrange`][python randrange], there are three different cases; we're only interested in one of them, so I'll simplify the source code as if that were the only case:

```python
def randrange(self, start, stop):
    """Choose a random item from range(start, stop).
    """

    istart = _index(start)
    istop = _index(stop)
    width = istop - istart
    istep = _index(step)
        if width > 0:
            return istart + self._randbelow(width)
        raise ValueError(f"empty range in randrange({start}, {stop})")
```

So to generate a random integer between 1 (inclusive) and 7 (exclusive), that's the same as generating a random integer between 0 (inclusive) and 6 (exclusive) and then adding 1 at the end; but the rabbit hole gets deeper. [What is `_randbelow`?][python randbelow toplevel]

```python
_randbelow = _randbelow_with_getrandbits
```

[OK.][python randbelow]

```python
def _randbelow_with_getrandbits(self, n):
    "Return a random int in the range [0,n).  Defined for n > 0."

    getrandbits = self.getrandbits
    k = n.bit_length()
    r = getrandbits(k)  # 0 <= r < 2**k
    while r >= n:
        r = getrandbits(k)
    return r
```

Now that's what I'm talkin' about! See how it's defined entirely in terms of [`getrandbits`][python getrandbits]? Like we said before, in the end it all goes back to coin flips. First we call [`bit_length`][python bit_length] on `n`, which works like this:

```
>>> n = 6
>>> bin(n)
'0b110'
>>> n.bit_length()
3
```

So Python looks at the upper limit for the range of integers we care about, and asks: how many bits do I need to represent that integer? In the case of rolling a die, the answer is three bits, or three coin flips. So far, nothing is different from what we did before, because if you recall, in the worst case we did need to flip our coin three times. But here instead of deciding what to do after each coin flip, we simply flip the coin three times right at the start. This gives a _uniform_ random three-bit integer. The smallest integer we can represent with three bits is 0, and the largest is 7. And indeed, if you run `random.getrandbits(3)` many times, you'll see this uniform distribution!

{{histogramEight}}

OK... but that's not what we actually want. We wanted the generated integer to be less than 6, so we can add 1 to it and get a uniform die roll. And that's where the `while` loop comes in: if the generated integer is 6 or 7, we completely ignore it, flip the coin three more times, and try again. We just keep doing this until we get something in the correct range. In general this technique is called [rejection sampling][]. As we said before, we can do this until it works, then add 1.

{{histogramDie}}

And really, this works fine. If all you wanted to know is how your computer rolls a die then congratulations, now you know! But... isn't this a bit inefficient? Well, we can plot the chance that

- we don't have to retry at all,
- we have to retry only once,
- we have to retry twice,
- etc.,

and draw those in a different kind of histogram.

{{histogramBits}}

This shows that it's not _horrible_: the chance of having to retry $n$ times is exponential in $n$. Actually, how well should we _expect_ to be able to do? Well, in the case where $n$ is a power of two, uniformly sampling a nonnegative integer less than $n$ is equivalent to flipping a coin $\log_2 n$ times; no need to retry. If $n$ is not a power of two then instead of directly giving the number of coin flips, that logarithm gives the [entropy][] of the distribution; if we're using random bits to faithfully sampling from the distribution, we can't do better than the entropy on average. So for varying values of $n$ on the $x$-axis, we can plot the entropy (in <span class="blue">blue</span>) and Python's expected number of coin flips (in <span class="red">red</span>) on the $y$-axis.

{{expectedBits}}

For some integers, Python will on average sample roughly the theoretical minimum possible number of bits. But for others, it samples twice as many bits as should be needed!

If you've been reading carefully, you may have noticed that there's some low-hanging fruit here: in the case where $n$ is a power of two, its binary representation is just a 1 followed by some number of 0s. In that case, we should _never_ need to retry, but Python samples from a range exactly twice as big as it should be, so retries are possible. But that case only affects powers of two, and it turns out that we can do better even for all those other numbers that aren't powers of two.

## A more clever approach

I say "more clever" instead of "more smarter" because there's probably a good reason people don't do this in practice. But we're gonna do it anyway! It turns out that when we reject a sample, we can save some of the randomness we've already accumulated; there's a discussion about this on [Stack Overflow][], which links to a paper about the [Fast Dice Roller algorithm][fdr]. Here's a Python implementation of that algorithm (modified slightly for the `n == 1` case); again, we assume that we have a `flip` function that returns `0` half the time and `1` the other half of the time:

```python
def fast_dice_roller(n):
    v = 1
    c = 0
    while True:
        while v < n:
            v = 2 * v
            c = 2 * c + flip()
        if c < n:
            return c
        else:
            v -= n
            c -= n
```

Let's walk through how this works for our 6-sided die example! So, `n == 6`. We'll visualize this process as a flow chart that goes from top to bottom and left to right (same as reading English prose). Each circle in the flow chart contains the value of `v` at that point in the process.

{{sequence6}}

As you can see from the code, we start with `v == 1`. We `flip` the coin (doubling `v` each time) until we have `v >= 6`, which in this case takes three coin flips. At this point we have `v == 8`, and we check to see whether `c < 6`. If so, we're all done! Otherwise, we subtract `6` from `v`, leaving `v == 2`. Now we only need to flip the coin _twice_ to get back to `v >= 6`. We again check; if `c < 6` then we return, and if not then we subtract `6` from `v` again. But we've seen this before: `8 - 6 == 2`, so we've hit a cycle! This cycle is indicated in the diagram by a big red asterisk.

We saw that once we've entered this cycle, we now only need to flip the coin twice for each attempt, instead of three times. OK, but does that actually help us? Turns out, yes, it does! Here's its expected number of coin flips for a given `n`, plotted in <span class="green">green</span>.

{{fdrBits}}

As you can see, while the <span class="red">red</span> curve can be up to double the height of the <span class="blue">blue</span> curve at a given point, the <span class="green">green</span> curve is never more than 2 flips above the <span class="blue">blue</span> curve.

Now you know not only how your computer rolls dice, but also how it _could_ roll dice even better. But... look at the shape of that graph. Kinda weird, right? Doesn't it just tug at your brain and make you want to understand it a bit more?

## More math

The key invariant in this algorithm is that, at the start every iteration of the `while True` loop, `c` is always a uniformly random nonnegative integer less than `v`. At the start we have `v == 1`, so the only such integer is `0`, and indeed that is `c`'s value! Now, think about what we do inside the inner `while` loop. We double `v`, so now `c` needs to be uniformly distributed across twice as many possible values. We start by doubling `c`. This always produces a value that is even! So we're missing all the odd values less than `v`. Then, the `flip` function always returns either `0` or `1`, so when we add its result after doubling `c`, we have a 50% chance to stay on an even value, and a 50% to go to the odd value immediately following it. We've restored the invariant that `c` is uniformly sampled from all nonnegative integers less than `v`.

But that's all the same as in our earlier rejection sampling approach. The trick is what we do after we check `if c < n`. When this is `True`, remember that `c` was uniformly sampled, so all the nonnegative integers less than `n` were equally likely, and so we just `return c`. But if it's `False`, now we know for a fact that `c >= n`. And again, all those nonnegative integers at least `n` but less than `v` were equally likely, so if we subtract `n` from both `v` and `c`, we maintain our invariant! Now `v` is a smaller value, but it's often still greater than `1`, so we can use some of the randomness we've already gotten to avoid flipping our coin quite as many times. You can see this in the diagram above: if we were just doing rejection sampling then we'd have to flip the coin three times every time we failed, but in this case we flip three times only at first, and then after that we only flip twice on every subsequent iteration.

That was but a simple example. Actually, there are even simpler ones: if we have a power of two like `n == 32`, there is no cycle at all; we just `flip` our coin a few times and then `return`.

{{sequence32}}

But these cycles can also get much longer: here's `n == 11`.

{{sequence11}}

This is a lot more interesting! In our `n == 6` example the cycle only went back to the previous node in the flow chart, but here it went all the way back to the beginning. So the cycles can be different lengths. Here are the first few of those cycle lengths, for `n == 1` through `n == 40`, and for powers of two where there's no cycle, I've inserted 1 as a placeholder value. (Try using 0 instead for a different rabbit hole!)

{{lengths}}

Turns out, if you look up this sequence, it already has a name! It's called [A136043][oeis a136043]:

> Period-lengths of the base-$2$ $\text{MR}$-expansions of the reciprocals of the positive integers.

Neat! The bit about "reciprocals of the positive integers" makes sense, because if you're trying to uniformly sample a nonnegative integer less than $n$, the chance of getting _any specific possibility_ should be equal to $1/n$. What is an $\text{MR}$-expansion, though? Turns out it's defined in [OEIS A136042][] (that page actually has a couple errors, which I've corrected here):

> The base-$m$ $\text{MR}$-expansion of a positive real number $x$, denoted by $\text{MR}(x, m)$, is the integer sequence $\{s(1), s(2), s(3), \ldots\}$, where $s(i)$ is the smallest exponent $d$ such that $(m^d)x(i) > 1$ and where $x(i + 1) = (m^d)x(i) - 1$, with the initialization $x(1) = x$. The base-$2$ $\text{MR}$-expansion of $1/29$ is periodic with period length $14$. Further computational results (see [A136043][oeis a136043]) suggest that if $p$ is a prime with $2$ as a primitive root, then the base-$2$ $\text{MR}$-expansion of $1/p$ is periodic with period $(p - 1)/2$. This has been confirmed for primes up to $2000$. The base-$2$ $\text{MR}$-expansion of $e = 2.71828\ldots$ is given in [A136044][oeis a136044].

This is a bit dense and I'm not going to work through it in detail here, but if you think about it, it roughly matches up with the algorithm we've been examining. See how it mentions "the smallest exponent $d$"? That's the same as our number of coin flips in each row of the diagrams we've been looking at! Each flip doubles `v`, so that's exponentiation right there. The process of defining $x(i + 1)$ in terms of $x(i)$ and $m^d$ (where $m = 2$ in our case) is essentially the same as our process of going from one row of the diagram to the next.

That's all I'll say about this sequence for now, but by all means dig further into this definition if you're curious! And if you think about it and look back at the diagrams we've been drawing, there are a couple other sequences we could define instead... can you find any of those in the OEIS?

## Conclusion

And there you have it: we learned

1. how your computer probably rolls dice,
2. a cleverer way your computer could roll dice, and
3. some fun math about patterns that emerge from that cleverer way.

One question you may still have is, how do computers flip coins in the first place? We kind of swept that under the rug at the beginning. Others have already written more about this, but simplifying a lot, your computer looks at something unpredictable in the real world, e.g. [lava lamps][], and uses some math to slice and dice what it sees into a sequence of random bits. Then your computer hands out those random bits to programs that ask for them, like the functions we've been looking at in this post.

Hopefully you had fun reading this! I've posted it on [Hacker News][] and on [Twitter][], so feel free to reply there with any questions or comments!

[binary]: https://youtu.be/sXxwr66Y79Y
[entropy]: https://en.wikipedia.org/wiki/Entropy_(information_theory)
[fdr]: https://arxiv.org/abs/1304.1916
[google die]: https://www.google.com/search?q=roll+a+die
[google coin]: https://www.google.com/search?q=flip+a+coin
[hacker news]: https://news.ycombinator.com/item?id=41895360
[lava lamps]: https://blog.cloudflare.com/lavarand-in-production-the-nitty-gritty-technical-details/
[oeis a136042]: https://oeis.org/A136042
[oeis a136043]: https://oeis.org/A136043
[oeis a136044]: https://oeis.org/A136044
[python]: https://www.python.org/
[python bit_length]: https://docs.python.org/3/library/stdtypes.html#int.bit_length
[python getrandbits]: https://github.com/python/cpython/blob/v3.12.7/Lib/random.py#L889-L895
[python inst]: https://github.com/python/cpython/blob/v3.12.7/Lib/random.py#L920
[python randbelow]: https://github.com/python/cpython/blob/v3.12.7/Lib/random.py#L242-L250
[python randbelow toplevel]: https://github.com/python/cpython/blob/v3.12.7/Lib/random.py#L271
[python randint]: https://github.com/python/cpython/blob/v3.12.7/Lib/random.py#L332-L336
[python randint toplevel]: https://github.com/python/cpython/blob/v3.12.7/Lib/random.py#L925
[python random]: https://docs.python.org/3/library/random.html
[python randrange]: https://github.com/python/cpython/blob/v3.12.7/Lib/random.py#L291-L330
[rejection sampling]: https://en.wikipedia.org/wiki/Rejection_sampling
[stack overflow]: https://stackoverflow.com/a/62920514/5044950
[three-sided coin]: https://imois.in/posts/3-sided-coin/
[twitter]: https://x.com/sgestep/status/1847998964437537044
