"use client"

import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react"
import type { NodeViewProps } from "@tiptap/react"
import { Node, mergeAttributes } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import ImageExtension from "@tiptap/extension-image"
import YoutubeExtension from "@tiptap/extension-youtube"
import LinkExtension from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { useRef, useState } from "react"

// Custom TipTap node for any non-YouTube video embed
const EmbedNode = Node.create({
  name: "embed",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      kind: { default: "iframe" }, // "iframe" | "video"
    }
  },

  parseHTML() {
    return [{ tag: "div[data-embed]" }]
  },

  renderHTML({ node }) {
    const src = node.attrs.src as string
    const kind = node.attrs.kind as string
    if (kind === "video") {
      return [
        "div",
        mergeAttributes({ "data-embed": "", class: "rich-video" }),
        ["video", { src, controls: "" }],
      ]
    }
    return [
      "div",
      mergeAttributes({ "data-embed": "", class: "rich-video" }),
      ["iframe", { src, allowfullscreen: "", frameborder: "0", loading: "lazy" }],
    ]
  },

  addCommands() {
    return {
      setEmbed:
        (attrs: { src: string; kind?: string }) =>
        ({ commands }: { commands: { insertContent: (content: unknown) => boolean } }) =>
          commands.insertContent({ type: "embed", attrs }),
    } as Record<string, unknown>
  },
})

/** Converts any video URL to an embed src + kind */
function resolveVideo(raw: string): { src: string; kind: "youtube" | "iframe" | "video" } | null {
  const url = raw.trim()
  if (!url) return null

  // YouTube (watch, shorts, embed, youtu.be)
  if (/youtube\.com|youtu\.be/.test(url)) return { src: url, kind: "youtube" }

  // Vimeo
  const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1]
  if (vimeoId) return { src: `https://player.vimeo.com/video/${vimeoId}`, kind: "iframe" }

  // RuTube
  const rutubeId = url.match(/rutube\.ru\/video\/([a-f0-9]{32})/i)?.[1]
  if (rutubeId) return { src: `https://rutube.ru/play/embed/${rutubeId}`, kind: "iframe" }

  // Kinescope
  const kinescopeId = url.match(/kinescope\.io\/(?:embed\/)?([a-zA-Z0-9]+)/)?.[1]
  if (kinescopeId) return { src: `https://kinescope.io/embed/${kinescopeId}`, kind: "iframe" }

  // Coub
  const coubId = url.match(/coub\.com\/view\/([a-zA-Z0-9]+)/)?.[1]
  if (coubId) return { src: `https://coub.com/embed/${coubId}`, kind: "iframe" }

  // VK Video — просто embed через iframe, VK не раскрывает простой API
  if (/vk\.com\/video/.test(url)) return { src: url, kind: "iframe" }

  // Direct video file
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return { src: url, kind: "video" }

  // Unknown URL — try as generic iframe
  return { src: url, kind: "iframe" }
}

// ── Image resize NodeView ───────────────────────────────────────

function ImageResizeView({ node, updateAttributes, selected }: NodeViewProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const align = (node.attrs.align as string | null) ?? "center"
  const width = node.attrs.width as number | null
  const justify: Record<string, string> = { left: "flex-start", center: "center", right: "flex-end" }

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startW = wrapRef.current?.getBoundingClientRect().width ?? 200
    setDragging(true)

    const onMove = (mv: MouseEvent) => {
      updateAttributes({ width: Math.max(60, Math.round(startW + mv.clientX - startX)) })
    }
    const onUp = () => {
      setDragging(false)
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }

  const tbBtn = (active: boolean): React.CSSProperties => ({
    padding: "2px 8px", borderRadius: 4, border: "none", cursor: "pointer",
    fontWeight: 700, fontSize: 12, lineHeight: 1.4,
    background: active ? "#e0e7ff" : "transparent",
    color: active ? "#4338ca" : "#374151",
  })

  return (
    <NodeViewWrapper as="div" style={{ display: "flex", justifyContent: justify[align] ?? "center", margin: "0.5rem 0", cursor: dragging ? "ew-resize" : undefined }}>
      <div ref={wrapRef} style={{ position: "relative", display: "inline-block", width: width ? `${width}px` : "auto", maxWidth: "100%" }}>
        <img src={node.attrs.src as string} alt={(node.attrs.alt as string) ?? ""} style={{ width: "100%", display: "block", borderRadius: "0.5rem" }} draggable={false} />

        {selected && <div style={{ position: "absolute", inset: 0, border: "2px solid #6366f1", borderRadius: "0.5rem", pointerEvents: "none" }} />}

        {selected && (
          <div style={{ position: "absolute", top: "-2.6rem", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 2, background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: "3px 6px", boxShadow: "0 4px 12px rgba(0,0,0,.15)", zIndex: 100, whiteSpace: "nowrap" }}>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: "left" }) }} style={tbBtn(align === "left")} title="Влево">←</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: "center" }) }} style={tbBtn(align === "center")} title="По центру">↔</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); updateAttributes({ align: "right" }) }} style={tbBtn(align === "right")} title="Вправо">→</button>
            <div style={{ width: 1, height: 14, background: "#e5e7eb", margin: "0 3px" }} />
            <button type="button" onMouseDown={(e) => { e.preventDefault(); updateAttributes({ width: null }) }} style={tbBtn(false)} title="Авто-ширина">Авто</button>
          </div>
        )}

        {selected && (
          <div onMouseDown={startResize} title="Потяни чтобы изменить размер" style={{ position: "absolute", bottom: 4, right: 4, width: 14, height: 14, background: "#6366f1", borderRadius: 3, cursor: "se-resize", zIndex: 10 }} />
        )}
      </div>
    </NodeViewWrapper>
  )
}

// ── Custom Image extension with resize + align ──────────────────

const CustomImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (a) => a.width ? { style: `width:${a.width}px;max-width:100%` } : {},
        parseHTML: (el) => el.style.width ? parseInt(el.style.width) : null,
      },
      align: {
        default: "center",
        renderHTML: (a) => ({ "data-align": a.align ?? "center" }),
        parseHTML: (el) => el.getAttribute("data-align") ?? "center",
      },
    }
  },
  renderHTML({ HTMLAttributes }) {
    const { "data-align": align, src, alt, ...rest } = HTMLAttributes
    const jc = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center"
    return ["div", { style: `display:flex;justify-content:${jc};margin:0.5rem 0` },
      ["img", mergeAttributes(rest, { src, alt: alt ?? "", class: "rich-img" })]]
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageResizeView)
  },
})

// ── types ───────────────────────────────────────────────────────

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

function Btn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded px-1 text-xs font-semibold transition ${
        active
          ? "bg-indigo-100 text-indigo-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="mx-0.5 h-4 w-px self-center bg-gray-200" />
}

export default function RichEditor({ value, onChange, placeholder }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      EmbedNode,
      CustomImage,
      YoutubeExtension.configure({
        HTMLAttributes: { class: "rich-video" },
        width: 480,
        height: 270,
      }),
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder ?? "Начните писать описание..." }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  })

  if (!editor) return null

  const uploadImage = async (file: File) => {
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    if (!res.ok) return
    const data = (await res.json()) as { url: string }
    editor.chain().focus().setImage({ src: data.url }).run()
  }

  const insertVideo = () => {
    const raw = prompt(
      "Ссылка на видео:\nYouTube, Vimeo, RuTube, Kinescope, Coub, VK или прямая ссылка на .mp4/.webm"
    )
    if (!raw) return

    const result = resolveVideo(raw)
    if (!result) return

    if (result.kind === "youtube") {
      editor.commands.setYoutubeVideo({ src: raw })
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(editor.commands as any).setEmbed({ src: result.src, kind: result.kind })
    }
  }

  const toggleLink = () => {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run()
    } else {
      const url = prompt("Введите ссылку (https://...):")
      if (url) editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-indigo-100 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-indigo-100 bg-gray-50 px-2 py-1.5">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Жирный">
          <strong>B</strong>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Курсив">
          <em>I</em>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Зачёркнутый">
          <s>S</s>
        </Btn>

        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Заголовок">
          H2
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Подзаголовок">
          H3
        </Btn>

        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Список">
          •≡
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Нумерованный список">
          1≡
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Цитата">
          ❝
        </Btn>

        <Sep />

        <Btn onClick={toggleLink} active={editor.isActive("link")} title="Ссылка">
          ⛓
        </Btn>
        <Btn onClick={() => fileRef.current?.click()} title="Вставить фото">
          🖼
        </Btn>
        <Btn onClick={insertVideo} title="Вставить видео (YouTube, Vimeo, RuTube, VK, .mp4 и др.)">
          ▶
        </Btn>
      </div>

      <EditorContent editor={editor} className="rich-editor-area px-3 py-2" />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void uploadImage(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}
