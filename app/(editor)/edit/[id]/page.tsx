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
// import { handleShortCut } from "@/lib/editor"
import EditorLeft from "@/components/editor/editor-left"
import EditorSection from "@/components/editor/editor-section"
import PreviewSection from "@/components/editor/preview-section"

type prevCodeType = {
  id: number
  section: string
  content: string
}

function page() {
  const [editorCodes, setEditorCodes] = useAtom(editorCodesState)
  const editorActiveSection = useAtomValue(editorActiveSectionState)
  const { theme } = useTheme()
  const [markdownCode, setMarkdownCode] = useState("")
  const monacoInstance = useAtomValue(monacoInstanceState)

  useEffect(() => {
    editorCodes
      .filter((code) => {
        return code.id === editorActiveSection
      })
      .map((code) => {
        setMarkdownCode(code.content)
      })
  }, [editorCodes, editorActiveSection])

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
        markdown={markdownCode}
        onCodeChange={(code) => {
          setEditorCodes((prev) => {
            return prev.map((prevCode: prevCodeType) => {
              if (prevCode.id === editorActiveSection) {
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
        code={editorCodes
          .map((code: editorCodeType) => code.content)
          .join("\n\n")}
      />
    </div>
  )
}

export default page
