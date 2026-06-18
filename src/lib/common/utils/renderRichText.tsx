import ReactMarkdown from 'react-markdown'

export function renderRichText(content: React.ReactNode, markdown: boolean) {
  if (!markdown || typeof content !== 'string') {
    return content
  }
  return <ReactMarkdown>{content}</ReactMarkdown>
}
