interface Metric {
  value: string;
  label: string;
}

const metrics: Metric[] = [
  { value: "$800K+", label: "saved / year replacing Google Maps" },
  { value: "0 → 8", label: "data team founded & led" },
  { value: "~28.5M", label: "trips scored for fraud" },
  { value: "7+ yrs", label: "in production ML & data" },
];

const ImpactStrip = () => {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.value}>
          <dt className="font-serif text-3xl md:text-4xl tracking-tight">
            {metric.value}
          </dt>
          <dd className="mt-2 text-sm text-muted-foreground leading-snug">
            {metric.label}
          </dd>
        </div>
      ))}
    </dl>
  );
};

export default ImpactStrip;
