This is a followup to my previous post titled ["How much slower is random access, really?"](https://samestep.com/blog/random-access/) which to my surprise, ended up getting some attention [on Hacker News](https://news.ycombinator.com/item?id=44356385). Here is the top comment (as of today), by @andersa:

> Note this is not true random access in the manner it occurs in most programs. By having a contiguous array of indices to look at, that array can be prefetched as it goes, and speculative execution will take care of loading many upcoming indices of the target array in parallel.
>
> A more interesting example might be if each slot in the target array has the next index to go to in addition to the value, then you will introduce a dependency chain preventing this from happening.

A great point! Let's do it. I have a shorter list of questions this time:

1. How much slower is iteration over these pairs compared to the two separate arrays, if they are stored in first-to-last order?
2. How much slower is iteration over these pairs in random order compared to first-to-last order?

I'm also not going to bother with arrays too big for RAM. Before running any new experiments, **I'm guessing** that both first-to-last order and random order will be about 2x slower on linked lists than on the separate-arrays setup, but that the performance ratio between the two orderings will be roughly the same as before (no difference if everything fits in L3 cache, then a roughly 4-8x ratio for data bigger than that). **(Spoiler: I was _very wrong_.)**

## Results

### MacBook

{{macbook}}
