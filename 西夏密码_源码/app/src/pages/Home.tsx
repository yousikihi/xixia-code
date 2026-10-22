import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import Transcriber from '@/sections/Transcriber';
import CardWorkshop from '@/sections/CardWorkshop';
import Gallery from '@/sections/Gallery';
import CultureQA from '@/sections/CultureQA';
import Wall from '@/sections/Wall';
import type { TranscribedItem } from '@/lib/tangut';
import { ADMIN_EVENT, loadConfig } from '@/lib/admin';

export default function Home() {
  const [items, setItems] = useState<TranscribedItem[] | null>(null);
  const [showBadge, setShowBadge] = useState(true);

  useEffect(() => {
    const sync = () => setShowBadge(loadConfig().showHeaderBadge);
    sync();
    window.addEventListener(ADMIN_EVENT, sync);
    return () => window.removeEventListener(ADMIN_EVENT, sync);
  }, []);

  return (
    <div className="min-h-dvh">
      {/* 页眉 */}
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-3">
          <span className="seal-badge h-10 w-10 text-lg font-bold" aria-hidden>
            夏
          </span>
          <span className="font-serif-cjk text-xl tracking-[0.3em]">西夏密码</span>
        </div>
        {showBadge && (
          <span className="border border-[hsl(var(--gilt))] px-2 py-0.5 text-xs tracking-widest text-[hsl(var(--gilt))]">
            AI 辅助生成内容已标识
          </span>
        )}
      </header>

      {/* 首屏 */}
      <section className="mx-auto w-full max-w-4xl px-4 pb-14 pt-10 text-center sm:pt-16">
        <p className="mb-4 text-sm tracking-[0.5em] text-[hsl(var(--glaze))]">
          让 天 书 活 过 来
        </p>
        <h1 className="font-serif-cjk text-5xl leading-tight tracking-[0.15em] sm:text-6xl">
          天书转写器
        </h1>
        <p className="mx-auto mt-6 max-w-xl leading-8 text-foreground/75">
          西夏文，颁行于公元 1036 年，六千余字，形似汉字而无一相同，
          西夏亡后渐成无人能读的「天书」。
          输入你的名字或一句祝福，我们依据公开学术资料整理的
          汉字—西夏文对照库，为你写下可考据的西夏文字。
        </p>
        <div className="mx-auto mt-8 h-px w-24 bg-[hsl(var(--gilt))]" aria-hidden />
      </section>

      <Transcriber items={items} setItems={setItems} />

      <CardWorkshop items={items} />

      <Gallery />

      <CultureQA />

      <Wall />

      {/* 页脚：出处与合规声明 */}
      <footer className="border-t border-border bg-secondary/40">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 text-sm leading-7 text-muted-foreground">
          <h2 className="mb-3 font-serif-cjk text-base tracking-[0.3em] text-foreground">
            数据与字体来源
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>
              对照数据：整理自开源项目 open-tangut（MIT 许可），其数据源自
              「古今文字集成」（CCAMC）与维基词典，释义参照李范文《夏汉字典》等公开学术成果。
            </li>
            <li>显示字体：Noto Serif Tangut（SIL Open Font License 1.1）。</li>
            <li>
              本工具为文化传播类对应转写，不构成学术释读；涉及西夏文的学术研究请以专业文献为准。
            </li>
            <li>本页面由学生团队设计开发，人工智能工具使用情况已在参赛材料中如实披露。</li>
          </ul>
          <p className="mt-6 font-serif-cjk tracking-[0.3em] text-foreground/60">
            西夏密码 · 2026 年全国大学生数字媒体科技作品及创意竞赛参赛作品（开发中）
          </p>
          <p className="mt-3">
            <Link
              to="/admin"
              className="text-xs tracking-widest text-muted-foreground underline-offset-4 transition-colors hover:text-[hsl(var(--seal))] hover:underline"
            >
              管理后台（演示）→
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
