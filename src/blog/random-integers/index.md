This post is about generating random integers; it's written to try to be accessible, but even if you already know about rejection sampling and all that jazz, you still probably don't know the main idea in this post! In that case feel free to skip to the ["more clever approach"](#clever) section.

---

If you [type "roll a die" into Google][google die], it... well, it rolls a die:

![Google "roll a die"](die.png)

But how does it do that?

To start: you may have heard that computers use binary numbers. That's true! This has been well-explained by many other people, so if you're unfamiliar, check out one of those explanations, e.g. [Khan Academy][binary].

_(6 minutes later)_ Welcome back! So yeah, every digit of every number in your computer is either a 0 or a 1. Kind of like how when you flip a coin, it's either heads or tails. ([Or its edge][three-sided coin], but that's a story different post entirely.) Let's talk about coin flips.

## Coin flips

You can also [Google "flip a coin"][google coin]:

![Google "flip a coin"](coin.png)

This is much closer to the computer's native tongue. All it has to do is generate a single random bit. For the remainder of this post, we're going to take "generate a random bit" as a basic primitive, and then build everything else on top of that.

Let's say we want to simulate a die roll but all we have is a coin to flip. How can we give each number on the die an equal chance? Well, we can flip the coin once. This at least lets us narrow down the possibilities:

- If we got **heads**, we'll say that the die roll is even: **2**, **4**, or **6**.
- If we got **tails**, we'll say that the die roll is odd: **1**, **3**, or **5**.

Either way we have 3 possibilities left. Now we're kinda stuck. If we flip the coin again, how do we choose what to do? Let's say our first flip was heads, so our choices are **2**, **4**, or **6**. We could say:

- If we get **heads** again, we'll say the die roll is **2**.
- If we get **tails**, we'll say the die roll is **4** or **6**.

And then if we got tails, we need to flip one more time to choose between **4** and **6**. But this is _not_ a fair die roll! We're twice as likely to get **2** as we are to get **4**, and similarly we're twice as likely to get **2** as **6**. What are we to do?

(TODO: insert histogram here)

## Python!

Let's look at how real computers do it. Boot up [the snake language][python]:

```
$ python
```

And then it's pretty straightforward to use the [builtin `random` module][random] to simulate rolling a die:

```
>>> import random
>>> random.randrange(1, 6)
5
>>> random.randrange(1, 6)
3
```

Now, you and I may have different ideas of fun, but I always enjoy doing a little deep dive of the source code for other people's software that I'm running. [How is `randrange` defined?][python randint toplevel]

```python
randrange = _inst.randrange
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

Fair enough. If you look at the [source for `randrange`][python randrange], there are three different cases; we're only interested in one of them, so I'll simplify the source code as if that were the only case:

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

The rabbit hole gets deeper. [What is `_randbelow`?][python randbelow toplevel]

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

Now that's what I'm talkin' about! See how it's defined entirely in terms of [`getrandbits`][python getrandbits]? Like we said before, in the end it all goes back to coin flips.

<h2 id="clever">A more clever approach</h2>

I say "more clever" instead of "smarter" because there's probably a good reason people don't do this in practice. But we're gonna do it here! It turns out there's a way to avoid wasting these fractions of a random bit; there's a discussion on [Stack Overflow][], which links to a paper about the [Fast Dice Roller algorithm][fdr].

[binary]: https://youtu.be/sXxwr66Y79Y
[fdr]: https://arxiv.org/abs/1304.1916
[google die]: https://www.google.com/search?q=roll+a+die
[google coin]: https://www.google.com/search?q=flip+a+coin
[python]: https://www.python.org/
[python getrandbits]: https://github.com/python/cpython/blob/v3.12.7/Lib/random.py#L889-L895
[python inst]: https://github.com/python/cpython/blob/v3.12.7/Lib/random.py#L920
[python randbelow]: https://github.com/python/cpython/blob/v3.12.7/Lib/random.py#L242-L250
[python randbelow toplevel]: https://github.com/python/cpython/blob/v3.12.7/Lib/random.py#L271
[python randint]: https://github.com/python/cpython/blob/v3.12.7/Lib/random.py#L332-L336
[python randint toplevel]: https://github.com/python/cpython/blob/v3.12.7/Lib/random.py#L925
[python randrange]: https://github.com/python/cpython/blob/v3.12.7/Lib/random.py#L291-L330
[stack overflow]: https://stackoverflow.com/a/62920514/5044950
[three-sided coin]: https://imois.in/posts/3-sided-coin/
