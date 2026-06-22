import type { ChartSeries } from "@/lib/types";

type RevenueChartProps = {
  series: ChartSeries[];
};

const chartWidth = 700;
const chartHeight = 240;
const chartPadding = 18;

export function RevenueChart({ series }: RevenueChartProps) {
  const allPoints = series.flatMap((item) => item.points);
  const maxValue = Math.max(...allPoints);
  const minValue = Math.min(...allPoints);

  return (
    <article className="insight-panel chart-card" aria-label="Ritmo de ventas">
      <div className="panel-heading">
        <h3>Ventas y margen por categoria</h3>
        <span>Ultimos 60 min</span>
      </div>
      <svg className="line-chart" viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Grafico de ritmo comercial por categoria">
        <path className="chart-grid" d="M0 45H700M0 105H700M0 165H700M0 225H700" />
        {series.map((item) => (
          <polyline
            className={`line line-${item.tone}`}
            fill="none"
            key={item.label}
            points={toPolylinePoints(item.points, minValue, maxValue)}
          />
        ))}
      </svg>
      <div className="legend-row" aria-label="Leyenda del grafico">
        {series.map((item) => (
          <span key={item.label}>
            <i className={`legend-${item.tone}`} />
            {item.label}
          </span>
        ))}
      </div>
    </article>
  );
}

function toPolylinePoints(points: number[], minValue: number, maxValue: number) {
  const range = Math.max(maxValue - minValue, 1);
  const xStep = chartWidth / Math.max(points.length - 1, 1);

  return points
    .map((point, index) => {
      const x = Math.round(index * xStep);
      const normalized = (point - minValue) / range;
      const y = Math.round(chartHeight - chartPadding - normalized * (chartHeight - chartPadding * 2));

      return `${x},${y}`;
    })
    .join(" ");
}
