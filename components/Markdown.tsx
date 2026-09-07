'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type {ReactNode} from 'react';
export function normalizeMarkdown(text:string){return text.replace(/\\([\\`*_{}\[\]()#+.!-])/g,'$1')}
const link=({href,children}:{href?:string;children?:ReactNode})=>href?.startsWith('http')?<a href={href} target="_blank" rel="noreferrer">{children}<span className="external-arrow">↗</span></a>:<span className="source-reference" title="项目原始资料引用">{children}</span>;
const markdownComponents={a:link,table:({children}:{children?:ReactNode})=><div className="table-scroll"><table>{children}</table></div>,pre:({children}:{children?:ReactNode})=><pre tabIndex={0}>{children}</pre>};
export default function Markdown({text}:{text:string}){return <div className="markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{normalizeMarkdown(text)}</ReactMarkdown></div>}
export function InlineMarkdown({text}:{text:string}){return <span className="inline-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{...markdownComponents,p:({children}:{children?:ReactNode})=><>{children}</>}}>{normalizeMarkdown(text)}</ReactMarkdown></span>}
