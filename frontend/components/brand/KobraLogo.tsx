import Image from "next/image";
import Link from "next/link";

type KobraLogoProps = {
  href?: string;
};

export function KobraLogo({ href = "/" }: KobraLogoProps) {
  return (
    <Link className="brand brand-logo" href={href} aria-label="Kobra">
      <Image src="/kobra-logo.png" alt="Kobra" width={1319} height={312} priority />
    </Link>
  );
}
