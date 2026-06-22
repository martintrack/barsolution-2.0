import type { Kpi } from "@/lib/types";

export function KpiCard({ label, value, detail, tone = "neutral" }: Kpi) {
  return (
    <article className={`kpi-tile ${tone === "primary" ? "kpi-primary" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}
