interface Role {
  company: string;
  title: string;
  period: string;
  summary: string;
}

const roles: Role[] = [
  {
    company: "Ridery",
    title: "Data Scientist → BI Manager → Technical Lead, Ridery Pay",
    period: "Sep 2022 — Present",
    summary:
      "Founded and led the data team (0→8), replaced Google Maps routing & autocomplete with custom systems ($800K+/yr saved), and shipped Ultravioleta, a real-time fraud system scoring every trip. Now technical lead of Ridery Pay, the company's fintech.",
  },
  {
    company: "300Dev (Coroto)",
    title: "Data Science Lead",
    period: "Nov 2020 — Sep 2022",
    summary:
      "Led data science across a fintech product portfolio — built the team and took ML models to production, including fraud detection and pricing.",
  },
  {
    company: "BITA",
    title: "Quantitative Analyst — Data Science",
    period: "Oct 2018 — Apr 2021",
    summary:
      "Implemented financial risk and multifactor models in Python for an index-construction platform operating over a 100,000+ equity universe.",
  },
  {
    company: "Universidad Central de Venezuela",
    title: "Data Science Professor",
    period: "2018 — 2022",
    summary:
      "Taught Introduction to Data Science in the School of Computation for 4+ years — the full data lifecycle, probability, and inferential statistics, with labs in Python and R.",
  },
  {
    company: "Freelance",
    title: "Data Scientist / ML Developer",
    period: "~2016 — 2018",
    summary:
      "Built predictive models (e.g. electricity-demand forecasting) for LatAm clients, working with large datasets in pandas and Spark.",
  },
];

const Experience = () => {
  return (
    <ul className="space-y-8">
      {roles.map((role) => (
        <li key={role.company} className="border-l-2 border-border pl-5">
          <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
            <h3 className="font-serif text-xl">{role.company}</h3>
            <span className="text-sm text-muted-foreground">{role.period}</span>
          </div>
          <p className="mt-1 text-sm font-medium text-foreground/90">{role.title}</p>
          <p className="mt-2 text-foreground/70 leading-relaxed">{role.summary}</p>
        </li>
      ))}
    </ul>
  );
};

export default Experience;
