import Link from "next/link";
import { KobraLogo } from "@/components/brand/KobraLogo";

export function DashboardNav() {
  return (
    <header className="topbar dashboard-topbar" aria-label="Navegacion principal">
      <KobraLogo />
      <nav className="nav-links" aria-label="Secciones">
        <Link href="/">Landing</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dashboard/metricas">Métricas</Link>
        <Link className="nav-action" href="/dashboard/metricas#recomendaciones-ia">
          Recomendaciones IA
        </Link>
      </nav>
    </header>
  );
}
