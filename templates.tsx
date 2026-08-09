import { JSX } from "preact";
import { importText } from "./util";

const hotness = await importText("hot.js");

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
      href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Roboto+Serif:ital,opsz,wght@0,8..144,100..900;1,8..144,100..900&display=swap"
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
          <a class="fa fa-envelope" href="mailto:sam@samestep.com"></a>
          <a
            class="fa-brands fa-bluesky"
            href="https://bsky.app/profile/sgestep.bsky.social"
          ></a>
          <a
            class="fa-brands fa-discord"
            href="https://discord.com/users/samestep"
          ></a>
          <a class="fa-brands fa-github" href="https://github.com/samestep"></a>
          <a class="fa-brands fa-gitlab" href="https://gitlab.com/sestep"></a>
          <a
            class="fa-brands fa-letterboxd"
            href="https://letterboxd.com/samestep/"
          ></a>
          <a
            class="fa-brands fa-linkedin"
            href="https://www.linkedin.com/in/sam-estep/"
          ></a>
          <a
            class="fa-brands fa-orcid"
            href="https://orcid.org/0000-0002-7107-7043"
          ></a>
          <a
            class="fa-brands fa-stack-overflow"
            href="https://stackoverflow.com/users/5044950/sam-estep"
          ></a>
          <a
            class="fa-brands fa-steam"
            href="https://steamcommunity.com/id/unstructured_quiche/"
          ></a>
          <a class="fa-brands fa-twitter" href="https://x.com/sgestep"></a>
          <a
            class="fa-brands fa-youtube"
            href="https://youtube.com/@sam-estep"
          ></a>
        </div>
        <p>
          Hi! <span class="wave">👋</span> I'm Sam{" "}
          <a class="pronouns" href="https://pronouns.org/he-him">
            (he/him)
          </a>
          . I'm a software engineer at{" "}
          <a href="https://mainstreetautonomy.com/">Main Street Autonomy</a>, on
          leave from the Software Engineering PhD program in{" "}
          <a href="https://s3d.cmu.edu/">S3D</a> at CMU, advised by{" "}
          <a href="https://www.cs.cmu.edu/~jssunshi/">Joshua Sunshine</a>. My
          research specialization is programming language design and
          implementation.
        </p>
        <p>
          Outside of work, I enjoy spending time with my lovely partner Lee and
          my amazing friends in Pittsburgh and elsewhere. I'm also a somewhat
          active contributor to{" "}
          <a href="https://github.com/NixOS/nixpkgs">Nixpkgs</a>. Waiting for{" "}
          <a href="https://www.teamcherry.com.au/blog/holiday2025">
            Sea of Sorrow
          </a>{" "}
          to come out.
        </p>
        <h2>Publications</h2>
        {pubs}
        <h2>Blog</h2>
        {blog}
      </main>
    </body>
  </html>
);

export interface Post {
  hot?: string;
  css: boolean;
  title: string;
  date: string;
  body: JSX.Element;
}

export const blogHtml = ({ hot, css, title, date, body }: Post) => (
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
      {css ? <link rel="stylesheet" href="style.css" /> : <></>}
      {hot === undefined ? (
        <></>
      ) : (
        <script
          type="module"
          dangerouslySetInnerHTML={{
            __html: `const url = ${JSON.stringify(hot)};\n${hotness}`,
          }}
        ></script>
      )}
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
        <div id="body">{body}</div>
      </main>
    </body>
  </html>
);
