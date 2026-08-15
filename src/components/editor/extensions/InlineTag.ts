import { Node, mergeAttributes, InputRule } from "@tiptap/core";

/**
 * Obsidian-style inline tag: typing `#tagname` (followed by space / end of
 * line) turns the word into a clickable tag pill.
 *
 * Renders as:
 *   <span data-tag="tagname" class="inline-tag">#tagname</span>
 *
 * Serializes back to plain text as `#tagname` so search & markdown export
 * keep working. Clicks are handled by NoteEditor (filters the vault).
 */
export const InlineTag = Node.create({
  name: "inlineTag",

  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-tag"),
        renderHTML: (attrs) => ({ "data-tag": attrs.name || "" }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-tag]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const name = (HTMLAttributes["data-tag"] as string) || "";
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class: "inline-tag",
        "data-tag": name,
        title: `Filter by #${name}`,
      }),
      `#${name}`,
    ];
  },

  renderText({ node }) {
    return `#${node.attrs.name || ""}`;
  },

  addInputRules() {
    return [
      new InputRule({
        // Matches `#tagname` at the start of a line or after whitespace,
        // ending at the cursor. Unicode letters/numbers plus _ - / so
        // nested tags like #project/design work.
        find: /(^|\s)(#[\p{L}\p{N}_/-]+)$/u,
        handler: ({ state, range, match }) => {
          const full = match[0] || "";
          const name = (full.match(/#([\p{L}\p{N}_/-]+)$/u) || [])[1];
          if (!name) return;

          const node = state.schema.nodes.inlineTag.create({ name });

          // Preserve the leading whitespace if there was any.
          const lead = full.startsWith("#") ? "" : " ";
          const start = range.from - (lead ? 1 : 0);
          if (lead) {
            state.tr.insertText(" ", start, range.to).replaceRangeWith(start + 1, range.to + 1, node);
          } else {
            state.tr.replaceRangeWith(start, range.to, node);
          }
        },
      }),
    ];
  },
});
