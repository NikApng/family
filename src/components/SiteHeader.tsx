"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const THEME_STORAGE_KEY = "pfu-theme";

const nav = [
  { href: "/#what", label: "Что мы делаем" },
  { href: "/#specialists", label: "Специалисты" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/services", label: "Услуги" },
  { href: "/events", label: "Афиша" },
  { href: "/gallery", label: "Фотоотчёты" },
  { href: "/contacts", label: "Контакты" },
];

function getHash(href: string) {
  const i = href.indexOf("#");
  return i >= 0 ? href.slice(i + 1) : "";
}

function getPath(href: string) {
  const i = href.indexOf("#");
  return i >= 0 ? href.slice(0, i) || "/" : href;
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M4.93 19.07l1.41-1.41" />
      <path d="M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menu, setMenu] = useState<{ open: boolean; pathname: string }>({
    open: false,
    pathname,
  });
  const router = useRouter();

  const open = menu.open && menu.pathname === pathname;

  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    root.classList.toggle("dark", !isDark);
    root.style.colorScheme = !isDark ? "dark" : "light";
    try {
      localStorage.setItem(THEME_STORAGE_KEY, !isDark ? "dark" : "light");
    } catch {}
  };

  const onNavClick =
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      const hash = getHash(href);
      if (!hash) {
        setMenu({ open: false, pathname });
        return;
      }

      e.preventDefault();

      const targetId = hash;
      const targetPath = getPath(href);
      const offset = 88;

      const scrollToId = () => {
        const el = document.getElementById(targetId);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      };

      if (pathname !== targetPath) {
        router.push(href);
        requestAnimationFrame(() => setTimeout(scrollToId, 60));
        setMenu({ open: false, pathname });
        return;
      }

      scrollToId();
      setMenu({ open: false, pathname });
    };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative h-15 w-15 overflow-hidden rounded-sm border border-border">
            <Image
              src="/images/image.png"
              alt="Логотип"
              fill
              className="object-cover"
            />
          </span>
          <span className="text-sm font-semibold tracking-tight text-text sm:text-base">
            Про Семью, Про Единство
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((x) => (
            <Link
              key={x.href}
              href={x.href}
              onClick={onNavClick(x.href)}
              className="text-sm font-medium text-muted hover:text-text"
            >
              {x.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Сменить тему"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-text shadow-sm transition hover:bg-accent"
          >
            <span className="theme-toggle__icon theme-toggle__icon--light">
              <MoonIcon className="h-5 w-5" />
            </span>
            <span className="theme-toggle__icon theme-toggle__icon--dark">
              <SunIcon className="h-5 w-5" />
            </span>
          </button>

          <Link
            href="/#book"
            onClick={onNavClick("/#book")}
            className="hidden h-10 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow sm:inline-flex"
          >
            Обратиться
          </Link>

          <button
            type="button"
            aria-label="Открыть меню"
            onClick={() =>
              setMenu((m) =>
                m.pathname === pathname
                  ? { open: !m.open, pathname }
                  : { open: true, pathname },
              )
            }
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card text-text shadow-sm transition hover:bg-accent md:hidden"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-bg md:hidden">
          <div className="mx-auto w-full max-w-6xl px-4 py-3">
            <div className="grid gap-2">
              {nav.map((x) => (
                <Link
                  key={x.href}
                  href={x.href}
                  onClick={onNavClick(x.href)}
                  className="flex h-11 items-center rounded-xl border border-border bg-card px-4 text-sm font-semibold text-text shadow-sm transition hover:bg-accent"
                >
                  {x.label}
                </Link>
              ))}

              <Link
                href="/#book"
                onClick={onNavClick("/#book")}
                className="mt-1 flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow"
              >
                Обратиться
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
