'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
export default function Markdown({text}:{text:string}){return <div className="markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{a:({href,children})=>href?.startsWith('http')?<a href={href} target="_blank" rel="noreferrer">{children}<span className="external-arrow">↗</span></a>:<span className="source-reference" title="项目原始资料引用">{children}</span>,table:({children})=><div className="table-scroll"><table>{children}</table></div>,pre:({children})=><pre tabIndex={0}>{children}</pre>}}>{text}</ReactMarkdown></div>}
