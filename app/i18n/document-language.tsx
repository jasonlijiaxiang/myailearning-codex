"use client";

import { useLayoutEffect } from "react";

export function DocumentLanguage({ lang }: { lang: string }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.lang;
    root.lang = lang;
    return () => {
      root.lang = previous;
    };
  }, [lang]);

  return null;
}
