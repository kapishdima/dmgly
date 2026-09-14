"use client";
import { useEffect, useState } from "react";
import type { CodeLanguage } from "@/lib/dmgly/highlight";

export function CodePreview({
  code,
  language,
  label,
}: {
  code: string;
  language: CodeLanguage;
  label: string;
}) {
  const [result, setResult] = useState<{
    code: string;
    language: CodeLanguage;
    html: string;
  } | null>(null);
  useEffect(() => {
    let active = true;
    void import("@/lib/dmgly/highlight")
      .then(({ highlightCode }) => highlightCode(code, language))
      .then((html) => {
        if (active) setResult({ code, language, html });
      })
      .catch(() => {
        /* The selectable plain-text fallback remains usable. */
      });
    return () => {
      active = false;
    };
  }, [code, language]);
  const html =
    result?.code === code && result.language === language ? result.html : null;
  return (
    <div
      className="code-scroll"
      data-language={language}
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      {html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre>
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
