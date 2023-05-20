"use client"

import { useEffect, useState } from "react"
import {
  editorActiveSectionState,
  editorCodesState,
  monacoInstanceState,
} from "@/atoms/editor"
import { handleShortCut } from "@/utils/editor"
import { useAtom, useAtomValue } from "jotai"
import { useTheme } from "next-themes"
import { Toaster } from "sonner"

import { editorCodeType } from "types"
import { defaultEditorContent } from "@/config/editor"
// import { handleShortCut } from "@/lib/editor"
import EditorLeft from "@/components/editor/editor-left"
import EditorSection from "@/components/editor/editor-section"
import PreviewSection from "@/components/editor/preview-section"

type prevCodeType = {
  section: string
  section_id: number
  content: string
}

export default function page({ params }: { params: { id: string } }) {
  const [editorCodes, setEditorCodes] = useAtom(editorCodesState)
  const editorActiveSection = useAtomValue(editorActiveSectionState)
  const { theme } = useTheme()
  const [markdownCode, setMarkdownCode] = useState("")
  const monacoInstance = useAtomValue(monacoInstanceState)
  const [loading, setLoading] = useState(true)

  const markdownId = params.id

  const getMarkdownPost = async (markdownId: string) => {
    const response = await fetch(`/api/posts/${markdownId}`, {
      method: "GET",
    })

    if (!response?.ok) {
      return true
    }

    const markdownPost = await response.json()
    console.log(markdownPost[0].postCodes)

    if (markdownPost[0].postCodes.length > 0) {
      let code = markdownPost[0].postCodes
      setEditorCodes(code)
      code
        .filter((code: editorCodeType) => {
          return code.section_id === editorActiveSection
        })
        .map((code: editorCodeType) => {
          setMarkdownCode(code.content)
        })
    } else {
      const defaultCode = [defaultEditorContent] as editorCodeType[]

      defaultCode
        .filter((code: editorCodeType) => {
          return code.section_id === editorActiveSection
        })
        .map((code: editorCodeType) => {
          setMarkdownCode(code.content)
        })
      setEditorCodes(defaultCode)
    }
    setLoading(false)
  }

  useEffect(() => {
    editorCodes
      .filter((code: editorCodeType) => {
        return code.section_id === editorActiveSection
      })
      .map((code: editorCodeType) => {
        setMarkdownCode(code.content)
      })
  }, [editorActiveSection])

  useEffect(() => {
    getMarkdownPost(markdownId)
  }, [markdownId])

  return (
    <div
      onKeyDown={(event) => {
        handleShortCut(event, monacoInstance!)
      }}
      className="flex h-[92vh] w-full"
    >
      <Toaster theme={theme === "dark" ? "dark" : "light"} closeButton />
      <EditorLeft />
      <EditorSection
        loading={loading}
        markdown={markdownCode}
        onCodeChange={(code) => {
          setEditorCodes((prev) => {
            return prev.map((prevCode: prevCodeType) => {
              if (prevCode.section_id === editorActiveSection) {
                return {
                  ...prevCode,
                  content: code,
                }
              }
              return prevCode
            })
          })
        }}
      />
      <PreviewSection
        loading={loading}
        code={editorCodes
          .map((code: editorCodeType) => code.content)
          .join("\n\n")}
      />
    </div>
  )
}
