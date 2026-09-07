import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: {default:'恩护之道 · 恩护唤魔师图文攻略', template:'%s · 恩护之道'},
  description:'从零开始学会恩护唤魔师。完整图文攻略、逐波实战解析、小队血条演示与可操作的治疗演练。',
  openGraph:{title:'恩护之道 · 从零开始，学会奶龙',description:'读懂原理，看懂实战，亲手练习。一本真正教你治疗的互动攻略。',locale:'zh_CN',type:'website'},
  twitter:{card:'summary_large_image',title:'恩护之道 · 恩护唤魔师图文攻略',description:'读懂原理，看懂实战，亲手练习。'},
  icons:{icon:'images/龙希尔徽记.png'},
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body>{children}</body></html>}
