import type { ActivityItem } from "@/lib/types";

type ActivityListProps = {
  title: string;
  eyebrow: string;
  items: ActivityItem[];
};

export function ActivityList({ title, eyebrow, items }: ActivityListProps) {
  return (
    <article className="insight-panel">
      <div className="panel-heading">
        <h3>{title}</h3>
        <span>{eyebrow}</span>
      </div>
      <ol className="activity-list">
        {items.map((item) => (
          <li key={`${item.time}-${item.text}`}>
            <span>{item.time}</span> {item.text}
          </li>
        ))}
      </ol>
    </article>
  );
}
