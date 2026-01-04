"use client"

import React from "react"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const parseInlineMarkdown = (text: string): React.ReactNode => {
    if (!text) return text
    
    const parts: React.ReactNode[] = []
    let keyCounter = 0
    
    // Find all markdown patterns with their positions
    const tokens: Array<{ type: 'text' | 'bold' | 'italic' | 'code' | 'link'; content: string; url?: string; start: number; end: number }> = []
    
    // Find bold first (to avoid conflicts with italic)
    const boldRegex = /\*\*(.+?)\*\*/g
    let match: RegExpExecArray | null
    while ((match = boldRegex.exec(text)) !== null) {
      tokens.push({
        type: 'bold',
        content: match[1],
        start: match.index,
        end: match.index + match[0].length,
      })
    }
    
    // Find code
    const codeRegex = /`([^`]+)`/g
    match = null
    while ((match = codeRegex.exec(text)) !== null) {
      const isInsideBold = tokens.some(t => t.start < match.index && match.index + match[0].length < t.end)
      if (!isInsideBold) {
        tokens.push({
          type: 'code',
          content: match[1],
          start: match.index,
          end: match.index + match[0].length,
        })
      }
    }
    
    // Find links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    match = null
    while ((match = linkRegex.exec(text)) !== null) {
      const isInsideOther = tokens.some(t => t.start < match.index && match.index + match[0].length < t.end)
      if (!isInsideOther) {
        tokens.push({
          type: 'link',
          content: match[1],
          url: match[2],
          start: match.index,
          end: match.index + match[0].length,
        })
      }
    }
    
    // Find italic (single asterisk, not part of bold)
    const italicRegex = /\*([^*]+?)\*/g
    match = null
    while ((match = italicRegex.exec(text)) !== null) {
      const isInsideOther = tokens.some(t => t.start < match.index && match.index + match[0].length < t.end)
      if (!isInsideOther) {
        tokens.push({
          type: 'italic',
          content: match[1],
          start: match.index,
          end: match.index + match[0].length,
        })
      }
    }
    
    // Sort by position
    tokens.sort((a, b) => a.start - b.start)
    
    // Build result
    let lastIndex = 0
    tokens.forEach((token) => {
      // Add text before token
      if (token.start > lastIndex) {
        const textBefore = text.substring(lastIndex, token.start)
        if (textBefore) parts.push(textBefore)
      }
      
      // Add formatted token
      switch (token.type) {
        case 'bold':
          parts.push(<strong key={keyCounter++}>{token.content}</strong>)
          break
        case 'italic':
          parts.push(<em key={keyCounter++}>{token.content}</em>)
          break
        case 'code':
          parts.push(
            <code key={keyCounter++} className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
              {token.content}
            </code>
          )
          break
        case 'link':
          parts.push(
            <a
              key={keyCounter++}
              href={token.url}
              className="text-gray-900 underline hover:text-gray-700 font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              {token.content}
            </a>
          )
          break
      }
      
      lastIndex = token.end
    })
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }
    
    return parts.length > 0 ? <>{parts}</> : text
  }

  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let inList = false
  let listType: 'ul' | 'ol' | null = null
  let listItems: React.ReactNode[] = []

  const flushList = () => {
    if (listItems.length > 0) {
      if (listType === 'ol') {
        elements.push(
          <ol key={`list-${elements.length}`} className="list-decimal ml-5 mb-2 space-y-1.5">
            {listItems}
          </ol>
        )
      } else {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc ml-5 mb-2 space-y-1.5">
            {listItems}
          </ul>
        )
      }
      listItems = []
      inList = false
      listType = null
    }
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    
    // Check for bullet list
    if (/^[-*]\s/.test(trimmed)) {
      flushList()
      inList = true
      listType = 'ul'
      const content = trimmed.substring(2)
      const listContent = parseInlineMarkdown(content)
      listItems.push(
        <li key={index} className="leading-relaxed pl-1">
          {listContent}
        </li>
      )
      return
    }
    
    // Check for numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      if (listType !== 'ol') {
        flushList()
        inList = true
        listType = 'ol'
      }
      const content = trimmed.replace(/^\d+\.\s/, '')
      const listContent = parseInlineMarkdown(content)
      listItems.push(
        <li key={index} className="leading-relaxed pl-1">
          {listContent}
        </li>
      )
      return
    }
    
    // Flush list if we hit a non-list line
    if (inList) {
      flushList()
    }
    
    // Check for headers
    if (/^###\s/.test(trimmed)) {
      const content = trimmed.substring(4)
      const headerContent = parseInlineMarkdown(content)
      elements.push(
        <h3 key={index} className="font-semibold text-gray-900 mt-3 mb-1.5 text-sm">
          {headerContent}
        </h3>
      )
      return
    }
    
    if (/^##\s/.test(trimmed)) {
      const content = trimmed.substring(3)
      const header2Content = parseInlineMarkdown(content)
      elements.push(
        <h2 key={index} className="font-bold text-gray-900 mt-4 mb-2 text-base">
          {header2Content}
        </h2>
      )
      return
    }
    
    if (/^#\s/.test(trimmed)) {
      const content = trimmed.substring(2)
      const header1Content = parseInlineMarkdown(content)
      elements.push(
        <h1 key={index} className="font-bold text-gray-900 mt-4 mb-2 text-lg">
          {header1Content}
        </h1>
      )
      return
    }
    
    // Regular paragraph
    if (trimmed) {
      const inlineContent = parseInlineMarkdown(trimmed)
      elements.push(
        <p key={index} className="mb-2 last:mb-0 leading-relaxed">
          {inlineContent}
        </p>
      )
    } else if (elements.length > 0) {
      // Empty line for spacing (only if not at start)
      elements.push(<div key={`spacer-${index}`} className="h-1" />)
    }
  })
  
  // Flush any remaining list
  flushList()

  return <div className={className}>{elements}</div>
}

