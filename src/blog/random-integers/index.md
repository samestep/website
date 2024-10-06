If you [type "roll a die" into Google][google die], it... well, it rolls a die:

![Google "roll a die"](die.png)

But how does it do that?

To start: you may have heard that computers use binary numbers. That's true!
This has been well-explained by many other people, so if you're unfamiliar,
check out one of those explanations, e.g. [Khan Academy][binary].

_(6 minutes later)_ Welcome back! So yeah, every digit of every number in your
computer is either a 0 or a 1. Kind of like how when you flip a coin, it's
either heads or tails. ([Or its edge][three-sided coin], but that's a story
different post entirely.) Let's talk about coin flips.

## Coin flips

You can also [Google "flip a coin"][google coin]:

![Google "flip a coin"](coin.png)

This is much closer to the computer's native tongue. All it has to do is
generate a single random bit. For the remainder of this post, we're going to
take "generate a random bit" as a basic primitive, and then build everything
else on top of that.

## Python!

[Python standard library][python randbelow]:

```python
    _randbelow = _randbelow_with_getrandbits
```

[binary]: https://youtu.be/sXxwr66Y79Y
[google die]: https://www.google.com/search?q=roll+a+die
[google coin]: https://www.google.com/search?q=flip+a+coin
[python randbelow]: https://github.com/python/cpython/blob/v3.12.7/Lib/random.py#L271
[three-sided coin]: https://imois.in/posts/3-sided-coin/
