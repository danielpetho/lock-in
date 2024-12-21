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
      <DynamicRippedPaper content={content} onContentChange={handleContentChange} />
  )
}

