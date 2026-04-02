import Link from "next/link";
import { APP_NAME_FULL } from "@/lib/constants";
import { LogoWordmark } from "@/components/LogoWordmark";
import { Send, Code2 } from "lucide-react";

const columns = [
  {
    title: "Protocol",
    links: [
      { label: "Markets", href: "/app/markets" },
      { label: "Vault", href: "/app/vault" },
      { label: "Portfolio", href: "/app/portfolio" },
      { label: "Governance", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Whitepaper", href: "/whitepaper" },
      { label: "Audit Reports", href: "/audits" },
      { label: "Brand Kit", href: "/brand" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Twitter", href: "https://twitter.com/xstream" },
      { label: "Discord", href: "https://discord.gg/xstream" },
      { label: "Telegram", href: "https://t.me/xstream" },
      { label: "GitHub", href: "https://github.com/xstream" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#f5f5f5] border-t border-border">
      {/* Giant XSTREAME watermark -- replicates the Maple footer style */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute inset-x-0 bottom-0 flex items-end justify-center overflow-hidden"
        style={{ height: "clamp(180px, 38vw, 420px)" }}
      >
        <span
          className="block font-[family-name:var(--font-safira)] leading-[1] tracking-[0.1em] text-center whitespace-nowrap"
          style={{
            fontSize: "clamp(120px, 18vw, 360px)",
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.02) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            transform: "translateY(35%)",
          }}
        >
          XSTREAM
        </span>
      </div>

      {/* Content layer */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-28 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <LogoWordmark href="/" iconSize={28} textClassName="text-base" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Split tokenized ETFs into income and price exposure tokens. Two
              markets. One vault.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="https://twitter.com/xstream"
                className="flex size-8 items-center justify-center rounded-md bg-black/[0.04] text-muted-foreground transition-colors hover:bg-black/[0.08] hover:text-foreground"
                aria-label="Twitter"
              >
                <Send className="size-4" />
              </Link>
              <Link
                href="https://github.com/xstream"
                className="flex size-8 items-center justify-center rounded-md bg-black/[0.04] text-muted-foreground transition-colors hover:bg-black/[0.08] hover:text-foreground"
                aria-label="GitHub"
              >
                <Code2 className="size-4" />
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-black/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {APP_NAME_FULL}. All rights
            reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/terms"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
