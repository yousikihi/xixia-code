import { useCallback, useEffect, useState } from 'react';
import {
  WALL_EVENT,
  loadLikes,
  loadWorks,
  removeWork,
  toggleLike,
  type WallTemplate,
  type WallWork,
} from '@/lib/wall';

interface Sample {
  id: string;
  han: string;
  tangut: string;
  template: WallTemplate;
}

/** 首期主题展「把祝福写进天书」——西夏文字符串来自本站对照库默认候选 */
const SAMPLES: Sample[] = [
  { id: 'sp1', han: '我爱宁夏', tangut: '𗕘𗒁𗙦𗴲', template: 'seal' },
  { id: 'sp2', han: '平安喜乐', tangut: '𗕷𗪚𗕫𗐽', template: 'stele' },
  { id: 'sp3', han: '贺兰山下', tangut: '𗲡𗝢𗄽𗘡', template: 'gilt' },
  { id: 'sp4', han: '吉祥如意', tangut: '𘀄𗨱𗍊𘎛', template: 'seal' },
  { id: 'sp5', han: '国泰民安', tangut: '𗂧𗵐𗚉𗪚', template: 'gilt' },
  { id: 'sp6', han: '风华正茂', tangut: '𗍄𗒆𗩭𗝰', template: 'stele' },
  { id: 'sp7', han: '心想事成', tangut: '𗤶𗾫𘅣𗵆', template: 'seal' },
  { id: 'sp8', han: '前程似锦', tangut: '𗂥𗀄𗕧𗬻', template: 'gilt' },
];

const TEMPLATE_NAME: Record<WallTemplate, string> = {
  stele: '碑刻卡',
  seal: '朱文印章卡',
  gilt: '鎏金书签卡',
};

/** 三种模板的展示风格（与卡片工坊 Canvas 模板同源） */
const TEMPLATE_STYLE: Record<WallTemplate, string> = {
  stele: 'border-border bg-card text-foreground',
  seal: 'border-[hsl(14_58%_36%)] bg-[hsl(var(--seal))] text-white',
  gilt: 'border-[hsl(30_10%_18%)] bg-[hsl(var(--ink))] text-[hsl(var(--gilt))]',
};

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 14c1.5-1.5 3-3.3 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3.4 1-4.5 2.5C10.9 4 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7z" />
    </svg>
  );
}

function WorkCard({
  han,
  tangut,
  template,
  footer,
}: {
  han: string;
  tangut: string;
  template: WallTemplate;
  footer: React.ReactNode;
}) {
  return (
    <figure className={`border p-5 text-center ${TEMPLATE_STYLE[template]}`}>
      <p className="font-tangut text-4xl leading-relaxed tracking-[0.2em]" lang="txg">
        {tangut}
      </p>
      <figcaption className="mt-3 border-t border-current/25 pt-2 text-xs tracking-[0.3em] opacity-80">
        {han}
      </figcaption>
      <div className="mt-3 flex items-center justify-between text-xs opacity-90">{footer}</div>
    </figure>
  );
}

export default function Wall() {
  const [works, setWorks] = useState<WallWork[]>([]);
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  const refresh = useCallback(() => {
    setWorks(loadWorks());
    setLikes(loadLikes());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(WALL_EVENT, refresh);
    return () => window.removeEventListener(WALL_EVENT, refresh);
  }, [refresh]);

  return (
    <section id="wall" className="mx-auto w-full max-w-4xl scroll-mt-6 px-4 pb-24">
      <div className="mb-6 text-center">
        <h2 className="font-serif-cjk text-2xl tracking-[0.25em]">共创作品墙</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          首期主题展「把祝福写进天书」 · 在上方生成天书卡并挂上墙，你的作品会出现在这里
        </p>
      </div>

      {/* 我的共创 */}
      <div className="mb-8">
        <h3 className="mb-3 flex items-center gap-2 font-serif-cjk tracking-[0.2em] text-foreground/85">
          <span className="seal-badge h-6 w-6 text-xs" aria-hidden>
            我
          </span>
          我的共创
          <span className="text-xs font-normal tracking-normal text-muted-foreground">
            保存在本浏览器 · 最新在前
          </span>
        </h3>
        {works.length === 0 ? (
          <div className="border border-dashed border-border bg-card/40 px-6 py-8 text-center text-sm leading-7 text-muted-foreground">
            这里还空着——先在上方「天书卡片工坊」生成一张天书卡，点击「挂上作品墙」，
            <br className="hidden sm:block" />
            你的西夏文作品就会出现在这里。
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {works.map((w) => (
              <WorkCard
                key={w.id}
                han={w.han}
                tangut={w.tangut}
                template={w.template}
                footer={
                  <>
                    <span className="flex items-center gap-1.5">
                      {TEMPLATE_NAME[w.template]}
                      {w.status === 'pending' && (
                        <span className="border border-current/50 px-1 py-px text-[10px] tracking-widest opacity-80">
                          审核中
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => removeWork(w.id)}
                      className="cursor-pointer underline-offset-4 transition-opacity hover:underline hover:opacity-100"
                      aria-label={`撤下作品 ${w.han}`}
                    >
                      撤下
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* 主题展样例 */}
      <h3 className="mb-3 flex items-center gap-2 font-serif-cjk tracking-[0.2em] text-foreground/85">
        <span className="seal-badge h-6 w-6 text-xs" aria-hidden>
          展
        </span>
        主题展样例
        <span className="text-xs font-normal tracking-normal text-muted-foreground">
          由本站对照库生成 · 可点赞
        </span>
      </h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {SAMPLES.map((s) => {
          const liked = !!likes[s.id];
          return (
            <WorkCard
              key={s.id}
              han={s.han}
              tangut={s.tangut}
              template={s.template}
              footer={
                <>
                  <span>{TEMPLATE_NAME[s.template]}</span>
                  <button
                    onClick={() => setLikes(toggleLike(s.id))}
                    aria-pressed={liked}
                    aria-label={`为作品 ${s.han} 点赞`}
                    className={`flex cursor-pointer items-center gap-1 transition-all active:scale-90 ${
                      liked ? 'text-[hsl(var(--gilt))]' : 'hover:text-[hsl(var(--gilt))]'
                    }`}
                  >
                    <Heart filled={liked} />
                    {liked ? '已赞' : '赞'}
                  </button>
                </>
              }
            />
          );
        })}
      </div>

      <p className="mt-6 text-xs leading-6 text-muted-foreground">
        你挂上的作品与点赞仅保存在本浏览器（localStorage），不会上传；
        跨端聚合展示、公开点赞与主题策展为完整方案功能，见参赛文档。所有西夏文内容均为对应转写 · AI 辅助生成，非学术释读。
      </p>
    </section>
  );
}
