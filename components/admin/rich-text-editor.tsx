"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Minus,
  Undo,
  Redo,
  RemoveFormatting,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAdminI18n } from "@/components/admin/admin-language-provider";
import { transliterateTrailingRomanWord } from "@/app/lib/nepali-input";

type RichTextEditorProps = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  nepaliTypingEnabled?: boolean;
};

export function RichTextEditor({
  content,
  onChange,
  placeholder,
  nepaliTypingEnabled = false,
}: RichTextEditorProps) {
  const { dictionary } = useAdminI18n();
  const editorPlaceholder = placeholder ?? dictionary.editor.placeholder;
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder: editorPlaceholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      handleKeyDown(_view, event) {
        if (
          !nepaliTypingEnabled ||
          event.isComposing ||
          event.ctrlKey ||
          event.metaKey ||
          event.altKey ||
          (event.key !== " " && !/^[,.;:!?)]$/.test(event.key))
        ) {
          return false;
        }

        const { from, empty } = _view.state.selection;

        if (!empty) {
          return false;
        }

        const textBefore = _view.state.doc.textBetween(0, from, "\n", "\0");
        const match = transliterateTrailingRomanWord(textBefore);

        if (!match) {
          return false;
        }

        const replacementFrom = from - (match.end - match.start);

        event.preventDefault();
        editor
          ?.chain()
          .focus()
          .insertContentAt(
            { from: replacementFrom, to: from },
            `${match.replacement}${event.key}`,
          )
          .run();
        return true;
      },
      handleDOMEvents: {
        blur: (_view) => {
          if (!nepaliTypingEnabled || !editor) {
            return false;
          }

          const { from, empty } = _view.state.selection;

          if (!empty) {
            return false;
          }

          const textBefore = _view.state.doc.textBetween(0, from, "\n", "\0");
          const match = transliterateTrailingRomanWord(textBefore);

          if (!match) {
            return false;
          }

          const replacementFrom = from - (match.end - match.start);

          editor
            .chain()
            .focus()
            .insertContentAt({ from: replacementFrom, to: from }, match.replacement)
            .run();
          return false;
        },
      },
    },
  });

  // Sync external content value with editor when it changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt(dictionary.editor.enterUrl, previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-col border rounded-md min-h-[350px] bg-background focus-within:ring-1 focus-within:ring-ring focus-within:border-ring">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/30 border-b">
        <Button
          type="button"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title={dictionary.editor.bold}
          aria-label={dictionary.editor.bold}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title={dictionary.editor.italic}
          aria-label={dictionary.editor.italic}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("underline") ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title={dictionary.editor.underline}
          aria-label={dictionary.editor.underline}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("strike") ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title={dictionary.editor.strikethrough}
          aria-label={dictionary.editor.strikethrough}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          type="button"
          variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title={dictionary.editor.heading2}
          aria-label={dictionary.editor.heading2}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title={dictionary.editor.heading3}
          aria-label={dictionary.editor.heading3}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("heading", { level: 4 }) ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          title={dictionary.editor.heading4}
          aria-label={dictionary.editor.heading4}
        >
          <Heading4 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title={dictionary.editor.bulletList}
          aria-label={dictionary.editor.bulletList}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title={dictionary.editor.orderedList}
          aria-label={dictionary.editor.orderedList}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title={dictionary.editor.blockquote}
          aria-label={dictionary.editor.blockquote}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          type="button"
          variant={editor.isActive("link") ? "secondary" : "ghost"}
          size="sm"
          onClick={addLink}
          title={dictionary.editor.insertLink}
          aria-label={dictionary.editor.insertLink}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title={dictionary.editor.horizontalRule}
          aria-label={dictionary.editor.horizontalRule}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title={dictionary.editor.clearFormatting}
          aria-label={dictionary.editor.clearFormatting}
        >
          <RemoveFormatting className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          title={dictionary.editor.undo}
          aria-label={dictionary.editor.undo}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          title={dictionary.editor.redo}
          aria-label={dictionary.editor.redo}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content Area */}
      <EditorContent
        editor={editor}
        className="flex-1 p-4 prose prose-sm max-w-none focus:outline-none overflow-y-auto [&_.tiptap]:outline-none [&_.tiptap]:min-h-[280px]"
      />

      {/* Basic fallback editor style sheet */}
      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .tiptap ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .tiptap ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .tiptap blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 1rem;
          font-style: italic;
          color: #4b5563;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .tiptap h2 {
          font-size: 1.5em;
          font-weight: 700;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        .tiptap h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        .tiptap h4 {
          font-size: 1em;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
      `}</style>
    </div>
  );
}
