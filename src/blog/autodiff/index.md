You may have taken the derivative of a function:

$$ f(x) = x^2 \quad\Longrightarrow\quad f'(x) = 2x $$

Of course, that's a pretty simple function. An [elementary function][], one might say. And it turns out that for any elementary function, you can take the derivative and get another elementary function. Neat!

But what if you have a function that's not so elementary? Maybe it's not written in flowy math notation with an italic font; maybe it's code in a monospace font, and it has `if` statements and `while` loops and recursion:

```
def f x = x * x
```

Why would I ever want to take the derivative of such a function? Well, because it lets me do this:

TODO

There's a technique called _automatic differentiation_ (often abbreviated "autodiff" or just "AD") which lets you take a program that computes a mathematical function, and turn it into a computer that computes the derivative of that function. This is pretty much a tale as old as time, so lots of people have written about it already: for instance, there's a great [post by Nick McCleery][differentiable programming in engineering] describing applications of differentiable programming in engineering, and there's also a great [post by Max Slater][differentiable programming from scratch] describing how to do autodiff on simpler programs that are expressed as fixed-shape computation graphs, along with some applications in computer graphics. You should read either or both of those if you're interested!

Here though, I'm gonna do something a bit different: I'm going to explain how you can take the derivative of _general programs_, not just computation graphs. And unlike all the many academic papers written on this topic, every example is going to be editable so you can play around and see the generated derivative code in real-time.

---

OK.

[differentiable programming from scratch]: https://thenumb.at/Autodiff/
[differentiable programming in engineering]: https://nickmccleery.com/posts/05-differentiable-programming-in-engineering/
[elementary function]: https://en.wikipedia.org/wiki/Elementary_function
