import DigitalTwinChat from "./components/DigitalTwinChat";

export default function Home() {
  const careerJourney = [
    {
      role: "Senior Data Engineer",
      company: "Tradeweb",
      period: "Oct 2025 - Present",
      highlight:
        "Architecting reliable analytics infrastructure for high-stakes financial data operations.",
    },
    {
      role: "Data Engineer II",
      company: "Royal Cyber Inc.",
      period: "Oct 2023 - Oct 2025",
      highlight:
        "Improved data availability to 99% with optimized pipelines, governance workflows, and quality monitoring.",
    },
    {
      role: "Data Engineer I",
      company: "Royal Cyber Inc.",
      period: "Nov 2022 - Dec 2023",
      highlight:
        "Built cloud-native ETL and MLOps pipelines across AWS, Azure, and Databricks with major runtime reduction.",
    },
    {
      role: "Data Engineer / Chapter Lead",
      company: "Omdena",
      period: "Jul 2021 - Jul 2022",
      highlight:
        "Led open-source initiatives and cross-functional teams to deliver social-impact ML and data projects.",
    },
  ];

  const futurePortfolioLinks = [
    {
      label: "Data Platform Case Studies",
      description:
        "Detailed architecture and impact breakdowns from enterprise-grade data systems.",
    },
    {
      label: "Gen-AI and Agentic Builds",
      description:
        "Production-oriented experiments focused on practical AI orchestration and automation.",
    },
    {
      label: "Community and Training Work",
      description:
        "Workshops, learning tracks, and initiatives designed to upskill engineering communities.",
    },
  ];

  return (
    <main className="site-shell">
      <div className="ambient-glow ambient-glow-top" aria-hidden />
      <div className="ambient-glow ambient-glow-bottom" aria-hidden />

      <header className="top-nav">
        <p className="brand">Qasim Hassan</p>
        <nav aria-label="Primary">
          <ul>
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#journey">Journey</a>
            </li>
            <li>
              <a href="#portfolio">Portfolio</a>
            </li>
            <li>
              <a href="#digital-twin">AI Twin</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </nav>
      </header>

      <section className="hero">
        <p className="eyebrow">Senior Data Engineer | 5+ Years Experience</p>
        <h1>
          Enterprise-grade data and AI systems with a sharp, modern execution
          edge.
        </h1>
        <p className="hero-copy">
          I design and scale cloud-native data platforms across AWS, Azure,
          Databricks, and Snowflake. My focus is simple: robust architecture,
          clean execution, and measurable business impact.
        </p>
        <div className="cta-row">
          <a
            className="button primary"
            href="https://www.linkedin.com/in/qasimhassan"
            target="_blank"
            rel="noopener noreferrer"
          >
            View LinkedIn
          </a>
          <a
            className="button secondary"
            href="https://linktr.ee/aiwithqasim"
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore Linktree
          </a>
        </div>
      </section>

      <section id="about" className="panel">
        <h2>About Me</h2>
        <p>
          I am a data engineering professional based in Pakistan, currently
          delivering scalable analytics infrastructure and intelligent
          automation solutions. From data pipelining and lineage to governance
          and observability, I bridge business and engineering priorities to
          deliver reliable, production-ready outcomes.
        </p>
        <p>
          Beyond core engineering, I actively contribute to communities and
          mentor upcoming talent through training and open collaboration.
        </p>
      </section>

      <section id="journey" className="panel">
        <h2>Career Journey</h2>
        <div className="journey-grid">
          {careerJourney.map((item) => (
            <article key={`${item.role}-${item.company}`} className="journey-card">
              <p className="journey-period">{item.period}</p>
              <h3>{item.role}</h3>
              <p className="journey-company">{item.company}</p>
              <p>{item.highlight}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Core Stack and Credentials</h2>
        <p>
          AWS, Azure, Databricks, Snowflake, Python, SQL, Apache Spark, and
          cloud-first data platform architecture.
        </p>
        <p>
          Certified in Databricks Data Engineering and Python, with continued
          focus on Gen-AI and agentic system design.
        </p>
      </section>

      <section id="portfolio" className="panel">
        <h2>Portfolio (Coming Next)</h2>
        <p>
          This section is intentionally prepared for upcoming public project
          showcases.
        </p>
        <div className="portfolio-grid">
          {futurePortfolioLinks.map((item) => (
            <article key={item.label} className="portfolio-card">
              <h3>{item.label}</h3>
              <p>{item.description}</p>
              <span>Publishing soon</span>
            </article>
          ))}
        </div>
      </section>

      <DigitalTwinChat />

      <footer id="contact" className="panel footer">
        <h2>Contact</h2>
        <p>qasimhassan1020@gmail.com | +92 300 2337565</p>
        <div className="contact-links">
          <a
            href="https://www.linkedin.com/in/qasimhassan"
            target="_blank"
            rel="noopener noreferrer"
          >
            linkedin.com/in/qasimhassan
          </a>
          <a
            href="https://linktr.ee/aiwithqasim"
            target="_blank"
            rel="noopener noreferrer"
          >
            linktr.ee/aiwithqasim
          </a>
        </div>
      </footer>
    </main>
  );
}
