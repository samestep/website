import { JSX } from "preact";

const Head = () => (
  <>
    <meta charset="utf-8" />
    <link rel="icon" type="image/png" href="/icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossorigin={true as any} // hack around Preact's JSX type checking
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
      rel="stylesheet"
    />
  </>
);

export const indexHtml = ({
  pubs,
  blog,
}: {
  pubs: JSX.Element;
  blog: JSX.Element;
}) => (
  <html lang="en-us">
    <head>
      <Head />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.1/css/all.min.css"
        integrity="sha512-5Hs3dF2AEPkpNAR7UiOHba+lRSJNeM2ECkwxUIxC1Q/FLycGTbNapWXB4tP889k5T5Ju8fs4b1P5z/iB4nMfSQ=="
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
      />
      <link rel="stylesheet" href="/index.css" />
      <title>Sam Estep</title>
    </head>
    <body>
      <main>
        <div class="me">
          <img class="photo" src="photo.jpeg" width="100" height="100" />
          <h1 class="name">Sam Estep</h1>
        </div>
        <div class="socials">
          <a class="fa fa-envelope fa-2x" href="mailto:estep@cmu.edu"></a>
          <a
            class="fa-brands fa-github fa-2x"
            href="https://github.com/samestep"
          ></a>
          <a
            class="fa-brands fa-linkedin fa-2x"
            href="https://www.linkedin.com/in/sam-estep/"
          ></a>
          <a
            class="fa-brands fa-orcid fa-2x"
            href="https://orcid.org/0000-0002-7107-7043"
          ></a>
          <a
            class="fa-brands fa-stack-overflow fa-2x"
            href="https://stackoverflow.com/users/5044950/sam-estep"
          ></a>
          <a
            class="fa-brands fa-twitter fa-2x"
            href="https://twitter.com/sgestep"
          ></a>
          <a
            class="fa-brands fa-youtube fa-2x"
            href="https://youtube.com/@sam-estep"
          ></a>
        </div>
        <p>
          Hi! <span class="wave">👋</span> I'm Sam{" "}
          <a class="pronouns" href="https://pronouns.org/he-him">
            (he/him)
          </a>
          . I'm a fourth-year PhD student in{" "}
          <a href="https://s3d.cmu.edu/">S3D</a> at CMU, advised by{" "}
          <a href="https://www.cs.cmu.edu/~jssunshi/">Joshua Sunshine</a>. I do
          research on <span class="topic">differentiable programming</span> (you
          should <a href="https://discord.gg/RZ37HrpheT">join us on Discord</a>
          !), with a particular focus on performance for interactive visual
          applications. Here are some of my projects:
        </p>
        <ul>
          <li>
            <a href="https://github.com/gradbench/gradbench">GradBench</a> is an
            extensible benchmark suite for comparing the performance of
            differentiable programming tools across domains. We use
            containerization and a shared communication protocol to simplify
            installation and usage of many tools across many programming
            languages, building this up as a shared resource for the
            differentiable programming community to maintain together as we move
            forward.
          </li>
          <li>
            <a href="https://github.com/samestep/floretta">Floretta</a> is a
            work-in-progress program transformation that takes a{" "}
            <a href="https://webassembly.org/">Wasm</a> module and augments it
            to compute gradients. Also, Floretta can itself be compiled to Wasm
            and included in a webpage as <code>floretta.wasm.gz</code> which is
            smaller than 40 kilobytes! The goal is to provide a tool which
            (similar to <a href="https://enzyme.mit.edu/">Enzyme</a>) operates
            over a well-supported low-level representation, while also providing
            the extreme portability of Wasm.
          </li>
          <li>
            <a href="https://github.com/rose-lang/rose">Rose</a> is the core
            engine for differentiable programming inside{" "}
            <a href="https://penrose.cs.cmu.edu/">Penrose</a>, engineered for
            performance in the interactive web setting. We use JavaScript as a
            host language for metaprogramming, and (similar to{" "}
            <a href="https://jax.readthedocs.io/">JAX</a>) use just-in-time
            compilation to get good performance. Unlike existing tools, we
            drastically reduce compilation time by allowing explicit definition
            of composable functions. Check out my publications list below for
            our paper in ECOOP 2024!
          </li>
        </ul>
        <p>
          Outside of work, I love{" "}
          <a href="https://ironcityboulders.com/">bouldering</a>, performing{" "}
          <a href="https://412improv.com/">improv comedy</a>, and baking. I'm
          also always looking for music and book recommendations, and trying to
          get my friends to join{" "}
          <a href="https://letterboxd.com/">Letterboxd</a> because it lets us
          take the set intersection of the movies <em>you</em> want to watch
          with the movies <em>I</em> want to watch (how cool is that?)
        </p>
        <h2>Webapps</h2>
        <p>Here are a few toys I've made over the years.</p>
        <div class="stuff">
          <a href="https://samestep.github.io/minkowski/">
            <div class="toy">
              <h3>Minkowski sum</h3>
              <h3 class="year">2023</h3>
            </div>
            <p>
              Look, some polygons! Drag them around to see their Minkowski sum.
              (Still a work in progress.)
            </p>
          </a>
          <a href="https://samestep.github.io/elliptic-curves/">
            <div class="toy">
              <h3>Elliptic curves</h3>
              <h3 class="year">2017</h3>
            </div>
            <p>
              See how the elliptic curve group law is associative: click three
              points to get each of their pairwise sums, then click the
              magnifying glass to see that all the three-way sums converge at
              the same point. Hit escape to reset or use the box in the top-left
              to select alternative parameters for the curve.
            </p>
          </a>
          <a href="https://samestep.github.io/lambda-calculus/">
            <div class="toy">
              <h3>Lambda calculus</h3>
              <h3 class="year">2016</h3>
            </div>
            <p>
              Type Lispy lambda calculus expressions like
              <code>((λ x x) 42)</code> to see their reduced form. Backslash
              automatically becomes <code>λ</code>, and parentheses are
              automatched.
            </p>
          </a>
        </div>
        <h2>Publications</h2>
        {pubs}
        <h2>Blog</h2>
        {blog}
      </main>
    </body>
  </html>
);

export interface Post {
  title: string;
  date: string;
  body: JSX.Element;
}

export const blogHtml = ({ title, date, body }: Post) => (
  <html lang="en-us">
    <head>
      <Head />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/monokai.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css"
      />
      <link rel="stylesheet" href="/blog.css" />
      <link rel="stylesheet" href="style.css" />
      <title>{title} | Sam Estep</title>
    </head>
    <body>
      <main>
        <h1>{title}</h1>
        <p>
          <em>
            by <a href="/">Sam Estep</a>, {date}
          </em>
        </p>
        {body}
      </main>
    </body>
  </html>
);
