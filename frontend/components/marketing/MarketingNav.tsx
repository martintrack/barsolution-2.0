import Link from "next/link";
import { KobraLogo } from "@/components/brand/KobraLogo";

export function MarketingNav() {
  return (
    <header className="topbar" aria-label="Navegacion principal">
      <KobraLogo />
      <nav className="nav-links" aria-label="Secciones">
        <Link href="#product">Propuesta</Link>
        <Link href="#value">Valor</Link>
        <Link href="#mvp">MVP</Link>
        <Link className="nav-action" href="/dashboard">
          Dashboard
        </Link>
      </nav>
    </header>
  );
}
