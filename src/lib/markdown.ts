/**
 * Convert a note's stored HTML (TipTap output) to Markdown.
 * Handles the block types the editor can produce: headings, paragraphs,
 * lists (incl. task lists), code fences, blockquotes, tables, images,
 * links, inline formatting and [[wiki-links]].
 *
 * Client-side only (uses the DOM). Kept intentionally simple — good enough
 * for vault export without pulling in a heavy dependency.
 */

function inlineToMarkdown(node: Node): string {
  let out = "";
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      out += child.textContent || "";
      return;
    }
    const el = child as HTMLElement;
    const tag = el.tagName;
    const text = inlineToMarkdown(el);

    switch (tag) {
      case "STRONG":
      case "B":
        out += `**${text}**`;
        break;
      case "EM":
      case "I":
        out += `*${text}*`;
        break;
      case "S":
      case "STRIKE":
      case "DEL":
        out += `~~${text}~~`;
        break;
      case "CODE":
        out += "`" + text + "`";
        break;
      case "U":
        out += `<u>${text}</u>`;
        break;
      case "MARK":
        out += `==${text}==`;
        break;
      case "A":
        out += `[${text}](${(el as HTMLAnchorElement).getAttribute("href") || ""})`;
        break;
      case "BR":
        out += "\n";
        break;
      case "IMG": {
        const img = el as HTMLImageElement;
        out += `![${img.getAttribute("alt") || ""}](${img.getAttribute("src") || ""})`;
        break;
      }
      case "SPAN": {
        const title = el.getAttribute("data-wikilink");
        out += title ? `[[${title}]]` : text;
        break;
      }
      default:
        out += text;
    }
  });
  return out;
}

function isTaskItem(li: HTMLElement): { checked: boolean } | null {
  const input = li.querySelector(':scope > label > input[type="checkbox"]');
  if (!input) return null;
  return { checked: (input as HTMLInputElement).checked };
}

function listItems(list: HTMLElement, depth: number): string {
  const ordered = list.tagName === "OL";
  const items = Array.from(list.children).filter((c) => (c as HTMLElement).tagName === "LI");
  return items
    .map((child, i) => {
      const li = child as HTMLElement;
      const indent = "  ".repeat(depth);
      const task = isTaskItem(li);
      const marker = task
        ? `- [${task.checked ? "x" : " "}] `
        : ordered
          ? `${i + 1}. `
          : "- ";

      // Inline text of the li, skipping nested lists.
      const textParts: string[] = [];
      li.childNodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE) {
          const t = (n as HTMLElement).tagName;
          if (t === "UL" || t === "OL" || t === "PRE") return;
        }
        textParts.push(inlineToMarkdown(n));
      });
      const text = textParts.join("").trim();

      // Nested lists.
      let nested = "";
      li.childNodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE) {
          const t = (n as HTMLElement).tagName;
          if (t === "UL" || t === "OL") nested += "\n" + listItems(n as HTMLElement, depth + 1);
        }
      });

      return indent + marker + text + (nested ? "\n" + nested.trimEnd() : "");
    })
    .join("\n");
}

function tableToMarkdown(table: HTMLElement): string {
  const rows = Array.from(table.querySelectorAll("tr"));
  if (rows.length === 0) return "";

  const cellsOf = (tr: HTMLElement) =>
    Array.from(tr.children).map((c) =>
      inlineToMarkdown(c as HTMLElement).replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ")
    );

  const headerRow = rows[0];
  const isHeaderRow = !!headerRow.querySelector("th");
  const header = cellsOf(headerRow);
  const bodyRows = (isHeaderRow ? rows.slice(1) : rows).map(cellsOf);

  const separator = header.map(() => "---");
  const lines = [
    `| ${header.join(" | ")} |`,
    `| ${separator.join(" | ")} |`,
    ...bodyRows.map((r) => `| ${r.join(" | ")} |`),
  ];
  return lines.join("\n");
}

function serializeBlock(node: HTMLElement): string[] {
  const tag = node.tagName;

  if (/^H[1-6]$/.test(tag)) {
    const level = Number(tag[1]);
    const text = inlineToMarkdown(node).trim();
    return text ? [`${"#".repeat(level)} ${text}`] : [];
  }

  if (tag === "P") {
    const text = inlineToMarkdown(node).trim();
    return text ? [text] : [];
  }

  if (tag === "PRE") {
    const code = node.querySelector("code");
    const langMatch = code?.className.match(/language-([\w-]+)/);
    const lang = langMatch ? langMatch[1] : "";
    return ["```" + lang, (node.textContent || "").replace(/\n$/, ""), "```"];
  }

  if (tag === "BLOCKQUOTE") {
    const inner = blockToMarkdown(node)
      .trim()
      .split("\n")
      .map((line) => (line ? `> ${line}` : ">"))
      .join("\n");
    return [inner];
  }

  if (tag === "UL" || tag === "OL") {
    return [listItems(node, 0)];
  }

  if (tag === "TABLE") {
    const md = tableToMarkdown(node);
    return md ? [md] : [];
  }

  if (tag === "HR") return ["---"];

  if (tag === "IMG") {
    const img = node as HTMLImageElement;
    return [`![${img.getAttribute("alt") || ""}](${img.getAttribute("src") || ""})`];
  }

  // Generic container: recurse into block children.
  const hasBlocks = Array.from(node.children).some((c) =>
    /^(H[1-6]|P|PRE|BLOCKQUOTE|UL|OL|TABLE|HR|DIV)$/.test((c as HTMLElement).tagName)
  );
  if (hasBlocks) {
    return blockToMarkdown(node).trim().split("\n");
  }

  const text = inlineToMarkdown(node).trim();
  return text ? [text] : [];
}

function blockToMarkdown(el: HTMLElement): string {
  const lines: string[] = [];
  el.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const t = (child.textContent || "").trim();
      if (t) lines.push(t);
      return;
    }
    lines.push(...serializeBlock(child as HTMLElement));
  });
  return lines.join("\n\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

export function htmlToMarkdown(html: string): string {
  if (typeof document === "undefined" || !html) return html;
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return blockToMarkdown(tmp);
}
