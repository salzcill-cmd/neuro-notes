import {
  Node,
  mergeAttributes,
  InputRule,
  PasteRule,
} from "@tiptap/core";
import { wikiLinkTitleFromMatch } from "@/lib/utils";

/**
 * Obsidian-style `[[wiki-link]]` inline node.
 *
 * - Typing `[[Title]]` converts to an atom node (input rule)
 * - Pasting `[[Title]]` converts as well (paste rule)
 * - Serializes back to plain text as `[[Title]]` via renderText,
 *   so link extraction & search keep working
 * - Renders as a clickable pill (`span[data-wikilink]`) — clicks are
 *   handled by NoteEditor, which shows the note preview popover
 */
export const WikiLink = Node.create({
  name: "wikiLink",

  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      title: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-wikilink"),
        renderHTML: (attrs) => ({ "data-wikilink": attrs.title || "" }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-wikilink]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const title = (HTMLAttributes["data-wikilink"] as string) || "";
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class: "wiki-link",
        title: `Open "${title}"`,
      }),
      ["span", { class: "wiki-bracket" }, "[["],
      title,
      ["span", { class: "wiki-bracket" }, "]]"],
    ];
  },

  renderText({ node }) {
    return `[[${node.attrs.title || ""}]]`;
  },

  addInputRules() {
    return [
      new InputRule({
        find: /\[\[[^\[\]]+\]\]$/,
        handler: ({ state, range, match }) => {
          const title = wikiLinkTitleFromMatch(match[0]);
          if (!title) return;
          const node = state.schema.nodes.wikiLink.create({ title });
          state.tr.replaceRangeWith(range.from, range.to, node);
        },
      }),
    ];
  },

  addPasteRules() {
    return [
      new PasteRule({
        find: /\[\[[^\[\]]+\]\]/g,
        handler: ({ state, range, match }) => {
          const title = wikiLinkTitleFromMatch(match[0]);
          if (!title) return;
          const node = state.schema.nodes.wikiLink.create({ title });
          state.tr.replaceRangeWith(range.from, range.to, node);
        },
      }),
    ];
  },
});
