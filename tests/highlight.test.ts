import { expect, test } from "bun:test";
import { highlightCode, type CodeLanguage } from "../lib/dmgly/highlight";

test("export highlighting supports JSON, shell, and Markdown with escaped user content", async () => {
  const samples: [CodeLanguage, string][] = [
    ["json", '{"name":"<script>alert(1)</script>"}'],
    ["bash", 'echo "<script>alert(1)</script>"'],
    [
      "markdown",
      '# Setup\n\n<script>alert(1)</script>\n\n```json\n{"enabled":true}\n```',
    ],
  ];
  for (const [language, code] of samples) {
    const html = await highlightCode(code, language);
    expect(html).toContain('class="shiki');
    expect(html).toContain('style="color:');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&#x3C;");
  }
});
