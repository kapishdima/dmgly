import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import json from "@shikijs/langs/json";
import bash from "@shikijs/langs/bash";
import markdown from "@shikijs/langs/markdown";
import githubLight from "@shikijs/themes/github-light";

export type CodeLanguage = "json" | "bash" | "markdown";
const highlighter = createHighlighterCore({
  themes: [githubLight],
  langs: [json, bash, markdown],
  engine: createJavaScriptRegexEngine(),
});

export async function highlightCode(code: string, lang: CodeLanguage) {
  return (await highlighter).codeToHtml(code, { lang, theme: "github-light" });
}
