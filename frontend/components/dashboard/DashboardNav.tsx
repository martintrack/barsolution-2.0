import Link from "next/link";
import { KobraLogo } from "@/components/brand/KobraLogo";

export function DashboardNav() {
  return (
    <header className="topbar dashboard-topbar" aria-label="Navegacion principal">
      <KobraLogo />
      <nav className="nav-links" aria-label="Secciones">
        <Link href="/">Landing</Link>
        <Link href="#recommendations">Recomendaciones</Link>
        <Link href="#inventory">Inventario</Link>
        <Link className="nav-action" href="/dashboard">
          Evento activo
        </Link>
      </nav>
    </header>
  );
}
