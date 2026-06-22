import type { InventoryRisk } from "@/lib/types";

type InventoryTableProps = {
  rows: InventoryRisk[];
};

export function InventoryTable({ rows }: InventoryTableProps) {
  return (
    <section id="inventory" className="insight-panel table-panel" aria-label="Inventario en riesgo">
      <div className="panel-heading">
        <h3>Inventario, margen y riesgo por SKU</h3>
        <span>Prioridad comercial</span>
      </div>
      <div className="data-table" role="table" aria-label="Inventario por producto">
        <div role="row">
          <span role="columnheader">Producto</span>
          <span role="columnheader">Zona</span>
          <span role="columnheader">Stock</span>
          <span role="columnheader">Sell-through</span>
          <span role="columnheader">Margen</span>
          <span role="columnheader">Estado</span>
        </div>
        {rows.map((row) => (
          <div role="row" key={`${row.product}-${row.zone}`}>
            <span role="cell">{row.product}</span>
            <span role="cell">{row.zone}</span>
            <span role="cell">{row.stock}</span>
            <span role="cell">{row.sellThrough}</span>
            <span role="cell">{row.margin}</span>
            <span role="cell">{row.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
