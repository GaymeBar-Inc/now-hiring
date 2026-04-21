interface LexicalNode {
  text?: string
  children?: LexicalNode[]
  [k: string]: unknown
}

/**
 * Recursively extracts plain text from a Lexical editor JSON node tree.
 * Used by the SEO plugin's generateDescription and the syncContentToMetaDescription hook.
 */
export function extractLexicalText(node: LexicalNode): string {
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node.children)) {
    return node.children.map(extractLexicalText).join('')
  }
  return ''
}
