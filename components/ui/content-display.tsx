type ContentNode = {
  type?: string;
  text?: string;
  content?: ContentNode[];
};

function extractText(node: unknown, depth = 0): string {
  if (typeof node === 'string') return node;
  if (!node || typeof node !== 'object' || depth > 20) return '';
  const n = node as ContentNode;
  if (typeof n.text === 'string') return n.text;
  if (Array.isArray(n.content)) {
    return n.content
      .map((child) => extractText(child, depth + 1))
      .filter(Boolean)
      .join('\n');
  }
  return '';
}

type Props = {
  content: unknown;
  emptyText: string;
};

export function ContentDisplay({ content, emptyText }: Props) {
  if (!content) return <p className="muted">{emptyText}</p>;
  const text = extractText(content);
  if (!text.trim()) return <p className="muted">{emptyText}</p>;
  return <div className="content-prose">{text}</div>;
}
