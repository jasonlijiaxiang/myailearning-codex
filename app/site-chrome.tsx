import Link from "next/link";
import type { ReactNode } from "react";

// Shared site chrome: every public page renders the same topbar and footer
// through these server components. Pages keep their own link semantics by
// passing explicit link sets; the per-locale defaults below reproduce the
// homepage navigation (including the 选型 selection menu and the mobile nav).

export type SiteNavLink = {
  href: string;
  label: string;
  prefetch?: false;
  hrefLang?: string;
  lang?: string;
};

export type SiteNavMenu = {
  menu: string;
  items: ReadonlyArray<{ href: string; label: string; prefetch?: false }>;
};

export type SiteNavItem = SiteNavLink | SiteNavMenu;

function isMenu(item: SiteNavItem): item is SiteNavMenu {
  return "menu" in item;
}

const zhDefaultLinks: readonly SiteNavItem[] = [
  { href: "#available-modules", label: "从问题开始" },
  { href: "/glossary", label: "术语库" },
  { href: "/knowledge-graph", label: "模块关系" },
  {
    menu: "选型",
    items: [
      { href: "/model-radar", label: "模型" },
      { href: "/coding-agents", label: "Code Agent" },
    ],
  },
  { href: "/references", label: "来源与证据 / Reference" },
  { href: "/en", label: "English", hrefLang: "en", lang: "en", prefetch: false },
];

const enDefaultLinks: readonly SiteNavItem[] = [
  { href: "/en/questions", label: "Questions", prefetch: false },
  { href: "/en/glossary", label: "Glossary", prefetch: false },
  { href: "#available-modules", label: "Find modules" },
  { href: "/en/knowledge-graph", label: "Dynamic explorer", prefetch: false },
  { href: "/en/model-radar", label: "Model radar", prefetch: false },
  { href: "/en/coding-agents", label: "Coding agents", prefetch: false },
  { href: "/en/references", label: "References", prefetch: false },
  { href: "/", label: "Chinese", hrefLang: "zh-CN", lang: "zh-CN", prefetch: false },
];

const zhDefaultMobileLinks: readonly SiteNavItem[] = [
  { href: "#available-modules", label: "从问题开始" },
  { href: "/glossary", label: "术语库" },
  { href: "/knowledge-graph", label: "模块关系" },
  {
    menu: "选型",
    items: [
      { href: "/model-radar", label: "模型" },
      { href: "/coding-agents", label: "Code Agent" },
    ],
  },
  { href: "/references", label: "来源与证据" },
  { href: "/en", label: "English", hrefLang: "en", lang: "en", prefetch: false },
];

function NavLinkEntry({ item }: { item: SiteNavLink }) {
  if (item.href.startsWith("#")) {
    return <a href={item.href}>{item.label}</a>;
  }
  return (
    <Link href={item.href} hrefLang={item.hrefLang} lang={item.lang} prefetch={item.prefetch}>
      {item.label}
    </Link>
  );
}

function SelectionMenu({ menu, items }: SiteNavMenu) {
  return (
    <details className="homeSelectionMenu">
      <summary>{menu}</summary>
      <div className="homeSelectionMenuList">
        {items.map((item) => (
          <Link href={item.href} key={item.href} prefetch={item.prefetch}>{item.label}</Link>
        ))}
      </div>
    </details>
  );
}

export function SiteNav({
  locale,
  ariaLabel,
  brand = "fieldbook",
  brandHref,
  brandAriaLabel,
  brandPrefetch,
  links,
  extraLinks,
  mobileLinks,
  mobileSummary,
}: {
  locale: "zh" | "en";
  ariaLabel?: string;
  brand?: "fieldbook" | "presales";
  brandHref?: string;
  brandAriaLabel?: string;
  brandPrefetch?: false;
  /** Full topbar link set; defaults to the locale homepage navigation. */
  links?: readonly SiteNavItem[];
  /** Appended after the default homepage navigation (ignored when `links` is set). */
  extraLinks?: readonly SiteNavItem[];
  /** Renders the homepage mobile nav (details.homeMobileNav) when provided. */
  mobileLinks?: readonly SiteNavItem[];
  mobileSummary?: string;
}) {
  const isEn = locale === "en";
  const homeHref = isEn ? "/en" : "/";
  const resolvedLinks = links ?? (isEn ? enDefaultLinks : zhDefaultLinks);
  const toplinks = [...resolvedLinks, ...(extraLinks ?? [])];
  const resolvedMobileLinks = mobileLinks
    ?? (links === undefined && extraLinks === undefined ? (isEn ? enDefaultLinks : zhDefaultMobileLinks) : null);

  return (
    <nav className="topbar" aria-label={ariaLabel ?? (isEn ? "Main navigation" : "主导航")}>
      <Link
        className="brand"
        href={brandHref ?? homeHref}
        aria-label={brandAriaLabel}
        prefetch={brandPrefetch}
      >
        {brand === "presales"
          ? <span>Cloud × AI / Presales Fieldbook</span>
          : isEn
            ? <span><strong>Cloud × AI Presales Fieldbook</strong><small>Evidence-backed technical field guide</small></span>
            : <span><strong>云与 AI 售前知识库</strong><small>Cloud × AI Presales Fieldbook</small></span>}
      </Link>
      <div className="toplinks">
        {toplinks.map((item, index) => (
          isMenu(item)
            ? <SelectionMenu key={`menu-${item.menu}-${index}`} menu={item.menu} items={item.items} />
            : <NavLinkEntry key={item.href} item={item} />
        ))}
      </div>
      {resolvedMobileLinks
        ? (
          <details className="homeMobileNav">
            <summary>{mobileSummary ?? (isEn ? "More" : "更多")}</summary>
            <nav aria-label={isEn ? "More navigation" : "更多导航"}>
              {resolvedMobileLinks.map((item, index) => (
                isMenu(item)
                  ? <SelectionMenu key={`mobile-menu-${item.menu}-${index}`} menu={item.menu} items={item.items} />
                  : <NavLinkEntry key={item.href} item={item} />
              ))}
            </nav>
          </details>
        )
        : null}
    </nav>
  );
}

export type SiteFooterLink = {
  href: string;
  label: string;
  prefetch?: false;
};

export function SiteFooter({
  locale = "zh",
  className,
  brand,
  note,
  links,
  backToTop,
  children,
}: {
  locale?: "zh" | "en";
  className?: string;
  /** Strong brand line rendered in its own div (standard module/directory footers). */
  brand?: ReactNode;
  /** Paragraph line (page descriptor, module update date, policy note…). */
  note?: ReactNode;
  /** Link list rendered with the back-to-top link in a shared div (glossary/questions style). */
  links?: readonly SiteFooterLink[];
  /** Back-to-top link override; pass `false` to omit it. */
  backToTop?: { href?: string; label?: string } | false;
  /** Free-form footer content (home and graph pages). Rendered verbatim. */
  children?: ReactNode;
}) {
  if (children !== undefined) {
    return <footer className={className}>{children}</footer>;
  }

  const isEn = locale === "en";
  const backLink = backToTop === false
    ? null
    : <a href={backToTop?.href ?? "#top"}>{backToTop?.label ?? (isEn ? "Back to top ↑" : "返回顶部 ↑")}</a>;

  return (
    <footer className={className}>
      {brand === undefined ? null : <div><strong>{brand}</strong></div>}
      {note === undefined ? null : <p>{note}</p>}
      {links !== undefined
        ? (
          <div>
            {links.map((link) => (
              link.href.startsWith("#")
                ? <a href={link.href} key={link.href}>{link.label}</a>
                : <Link href={link.href} key={link.href} prefetch={link.prefetch}>{link.label}</Link>
            ))}
            {backLink}
          </div>
        )
        : backLink}
    </footer>
  );
}
