import { JSX } from "preact";

interface Author {
  name: string;
  href: string;
}

const author = (name: string, href: string): Author => ({ name, href });

const brad = author("Brad A. Myers", "https://www.cs.cmu.edu/~bam/");

const eric = author("Éric Tanter", "https://pleiad.cl/people/etanter");

const hweiShin = author("Hwei-Shin Harriman", "https://hsharriman.github.io/");

const jenna = author("Jenna DiVincenzo", "https://jennalwise.github.io/");

const jiri = author("Jiří Minarčík", "https://minarcik.com/");

const johannes = author("Johannes Bader", "https://johannes-bader.com/");

const jonathan = author("Jonathan Aldrich", "https://www.cs.cmu.edu/~aldrich/");

const josh = author("Joshua Sunshine", "https://www.cs.cmu.edu/~jssunshi/");

const keenan = author("Keenan Crane", "https://www.cs.cmu.edu/~kmcrane/");

const ken = author("Ken Koedinger", "https://pact.cs.cmu.edu/koedinger.html");

const matt = author("Matthew C. Davis", "https://cmumatt.github.io/");

const nimo = author("Wode Ni", "https://www.cs.cmu.edu/~woden/");

const raven = author("Raven Rothkopf", "https://ravenrothkopf.com/");

const sam = author("Sam Estep", "/");

const sang = author(
  "Sangheon Choi",
  "https://www.linkedin.com/in/sang-heon-choi/",
);

interface Venue {
  name: string;
  href: string;
}

interface Publication {
  title: string;
  href: string;
  venue: Venue;
  authors: Author[];
  preprint?: boolean;
}

const pubs: Publication[] = [
  {
    title: "Codifying Visual Representations",
    venue: {
      name: "DIAGRAMS 2024",
      href: "https://diagrams-2024.diagrams-conference.org/",
    },
    authors: [nimo, sam, hweiShin, jiri, josh],
    href: "https://www.cs.cmu.edu/~woden/assets/diagrams-24-penrose.pdf",
    preprint: true,
  },
  {
    title: "Rose: Composable Autodiff for the Interactive Web",
    href: "https://doi.org/10.4230/LIPIcs.ECOOP.2024.15",
    venue: { name: "ECOOP 2024", href: "https://2024.ecoop.org/" },
    authors: [sam, nimo, raven, josh],
  },
  {
    title:
      "Minkowski Penalties: Robust Differentiable Constraint Enforcement for Vector Graphics",
    href: "https://doi.org/10.1145/3641519.3657495",
    venue: { name: "SIGGRAPH 2024", href: "https://s2024.siggraph.org/" },
    authors: [jiri, sam, nimo, keenan],
  },
  {
    title:
      "Edgeworth: Efficient and Scalable Authoring of Visual Thinking Activities",
    href: "https://doi.org/10.1145/3657604.3662034",
    venue: {
      name: "L@S 2024",
      href: "https://learningatscale.hosting.acm.org/las2024/",
    },
    authors: [nimo, sam, hweiShin, ken, josh],
  },
  {
    title: "NaNofuzz: A Usable Tool for Automatic Test Generation",
    href: "https://doi.org/10.1145/3611643.3616327",
    venue: {
      name: "ESEC/FSE 2023",
      href: "https://conf.researchr.org/home/fse-2023",
    },
    authors: [matt, sang, sam, brad, josh],
  },
  {
    title: "Gradual Program Analysis for Null Pointers",
    href: "https://doi.org/10.4230/LIPIcs.ECOOP.2021.3",
    venue: { name: "ECOOP 2021", href: "https://2021.ecoop.org/" },
    authors: [sam, jenna, jonathan, eric, johannes, josh],
  },
];

const authors = (array: Author[]): JSX.Element => {
  const elems = array.map(({ name, href }) => <a href={href}>{name}</a>);
  if (elems.length === 0) {
    throw Error("no authors");
  } else if (elems.length === 1) {
    return elems[0];
  } else if (elems.length === 2) {
    return (
      <>
        {elems[0]} and {elems[1]}
      </>
    );
  } else {
    const last = elems.pop();
    const commas = elems.map((elem) => <>{elem}, </>);
    return (
      <>
        {commas}and {last}
      </>
    );
  }
};

export const publications = (): JSX.Element => (
  <ul>
    {pubs.map((pub) => {
      const title = pub.preprint ? (
        pub.title
      ) : (
        <a href={pub.href}>{pub.title}</a>
      );
      const note = pub.preprint ? (
        <>
          {" "}
          (<a href={pub.href}>pre-print</a>; accepted, pending publication)
        </>
      ) : (
        ""
      );
      return (
        <li>
          {title},{" "}
          <span class="venue">
            in <a href={pub.venue.href}>{pub.venue.name}</a>
          </span>
          , by {authors(pub.authors)}
          {note}.
        </li>
      );
    })}
  </ul>
);
