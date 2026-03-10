Today [Veritasium published a video](https://youtu.be/Ol18JoeXlVI) about [Newcomb's paradox](https://en.wikipedia.org/wiki/Newcomb%27s_problem): you walk into a room with one transparent box containing $1000, and one opaque box. You're allowed to either take both boxes or just take the opaque box. Before you walk in, a supercomputer predicted which choice you'd make, and put $1000000 in the opaque box if it predicted you'd take just the one, or $0 if it predicted you'd take both. Thousands of people have gone through the room, and the computer has always been right. _What should you do?_

I'm a fan of this paradox and I like Veritasium. But the way they describe the setup is **wrong**:

> Don't worry about how the supercomputer is making its prediction. Instead of a computer, you could think of it as a superintelligent alien, a cunning demon, or even a team of the world's best psychologists. It really doesn't matter who or what is making the prediction.

It actually matters **a lot**.

## Demons

If the predictor is [Laplace's demon](https://en.wikipedia.org/wiki/Laplace%27s_demon) and genuinely knows the location and momentum of every particle in the universe, then sure, I buy that it can accurately predict what I'll choose.

## Computers and psychologists

If the predictor is a computer or a team of psychologists, they can still predict a lot. The main discussion in the video is about how the predictor knows what thought process you're gonna use to decide whether to one-box or two-box, which I totally agree that a computer or psychologist can predict by knowing about your history and personality.

But come on. You know some smartasses are gonna walk in there and flip a coin. No supercomputer on Earth can predict that consistently.

So, my complaint about the Veritasium video is that they present it as if it doesn't matter whether there's anything supernatural going on.

## Probabilities

Technically, I didn't present the problem in _exactly_ the same way that Veritasium did. They only said that the computer has _almost_ always been correct, not that it has always been correct. And that of course also completely changes the problem: if the computer has made mistakes in the past, then it's possible for it to make mistakes in the future.

In the video, Gregor gives an argument for one-boxing based on probabilities. He starts by assuming that the probability the computer guesses your answer correctly is $C$, and then derives that you should one-box as long as $C > 0.505$. But this is also flawed. There's a hidden assumption that $C$ is _independent_ of whether you decide to one-box or two-box. But there's no a priori reason to believe that. If the computer has been wrong before, it'd be very surprising for it to be wrong _just as often_ for one-boxers and two-boxers. And so there's no reason to expect that the computer would continue to be accurate if you use try to trick it via some clever decision-making process that other people rarely use.

Anyways, I think that the problem is far less interesting if the predictor has been wrong before. Typically, the predictor is presented as having never been wrong, which makes the problem actually interesting from a decision-theoretic standpoint.

## Nothing new under the sun

Obviously I'm not the first one to think of this. Before I wrote this post, I Googled "newcomb's paradox flip a coin" and found these results just on the front page:

- In [Nozick's original 1969 paper](https://web.archive.org/web/20190331225650/http://faculty.arts.ubc.ca/rjohns/nozick_newcomb.pdf), the predictor has never been wrong before, and also has one additional twist to its behavior: if it predicts that "you will consciously randomize your choice," then it puts $0 in the opaque box. I guess that's one possible answer to my complaint, but in my opinion it just pushes the problem back further: what exactly constitutes "consciously randomizing your choice"? Flipping a coin isn't truly random, it's just chaotic. Are not my typical brain processes also chaotic? Where do we draw the line?

- [A 2010 paper](https://www.scirp.org/journal/paperinformation?paperid=1438) titled "A Study of Quantum Strategies for Newcomb's Paradox". I haven't read the whole paper, but it's a lot more rigorous than what I've laid out here, exploring the idea of not just flipping a coin, but producing genuine randomness using some quantum shenanigans.

- [A 2021 Hacker News thread](https://news.ycombinator.com/item?id=28589222) in which someone proposes flipping a coin and another person responds with an interesting connection to the [halting problem](https://en.wikipedia.org/wiki/Halting_problem).

- [A 2023 Medium comment](https://medium.com/@camiolo/your-assumption-is-invalid-3ad162783ae2) asserting that an AI cannot predict a coin flip.

- [A 2023 blog post](https://gcher.com/posts/2023-07-28-newcomb-paradox/) in which the amount of money in the opaque box is reduced so that a random strategy actually gives you a higher expected value than just always picking the opaque box by itself.

Such a fun paradox! I suspect that these arguments will continue indefinitely. :)
