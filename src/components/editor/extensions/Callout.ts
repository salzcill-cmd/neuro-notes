import { Node, mergeAttributes, InputRule } from "@tiptap/core";

export type CalloutType = "note" | "tip" | "warning" | "error" | "success" | "info";

/**
 * Obsidian-style callout block.
 *
 * Type `> [!note] Title` (or just `[!warning]`) on its own line and press
 * space/Enter — the line converts into a styled callout. The first line
 * becomes the title, the rest is regular note content.
 *
 * Stores as:
 *   <div class="callout callout-note" data-callout-title="...">
 *     <div class="callout-content">…</div>
 *   </div>
 */
export const Callout = Node.create({
  name: "callout",

  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      type: {
        default: "note",
        parseHTML: (el) => {
          const className = (el as HTMLElement).className || "";
          const match = className.match(/callout-(\w+)/);
          return match ? match[1] : "note";
        },
        renderHTML: () => ({}),
      },
      title: {
        default: "",
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-callout-title") || "",
        renderHTML: (attrs) => ({ "data-callout-title": attrs.title || "" }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div.callout",
        contentElement: "div.callout-content",
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const type = node.attrs.type || "note";
    const title = node.attrs.title || "";
    const children: Array<[string, Record<string, string>, string | number]> = [];
    if (title) {
      children.push(["div", { class: "callout-title" }, title]);
    }
    children.push(["div", { class: "callout-content" }, 0]);
    return [
      "div",
      mergeAttributes(HTMLAttributes, { class: `callout callout-${type}` }),
      ...children,
    ];
  },

  addInputRules() {
    return [
      new InputRule({
        // Matches a line like `> [!note] Title` or `[!note]` (the `>` may
        // already have been consumed by the blockquote input rule).
        find: /^\s*>?\s*\[!(note|tip|warning|error|success|info)\](?:\s+([^\n]*))?$/,
        handler: ({ state, range, match }) => {
          const type = (match[1] as string) || "note";
          const title = ((match[2] as string) || "").trim();

          const { tr } = state;
          const $from = tr.doc.resolve(range.from);

          // Replace the whole enclosing block — expanding out of a blockquote
          // if the `>` already turned into one.
          let startPos = $from.start($from.depth);
          let endPos = $from.end($from.depth);
          for (let d = $from.depth; d > 0; d--) {
            const candidate = $from.node(d);
            if (candidate.type.name === "blockquote") {
              startPos = $from.before(d);
              endPos = $from.after(d);
              break;
            }
          }

          const titlePara = state.schema.nodes.paragraph.create(
            null,
            title ? [state.schema.text(title)] : null
          );
          const callout = state.schema.nodes.callout.create({ type, title }, titlePara);
          tr.replaceWith(startPos, endPos, callout);
          tr.scrollIntoView();
        },
      }),
    ];
  },
});
