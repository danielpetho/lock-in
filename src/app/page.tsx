'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const DynamicRippedPaper = dynamic(() => import('@/components/ripped-paper'), { ssr: false })

export default function Home() {
  const [content, setContent] = useState('')

  const handleContentChange = (value: string) => {
    setContent(value)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-4 sm:p-8">
      <DynamicRippedPaper content={content} onContentChange={handleContentChange} />
    </main>
  )
}

