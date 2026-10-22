import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  ADMIN_EVENT,
  clearLogs,
  loadConfig,
  loadLogs,
  logAction,
  saveConfig,
  type AdminConfig,
  type AdminLog,
} from '@/lib/admin';
import {
  WALL_EVENT,
  approveWork,
  loadWorks,
  removeWork,
  type WallWork,
} from '@/lib/wall';

type Tab = 'review' | 'assets' | 'labels' | 'logs';

const TABS: { id: Tab; name: string; desc: string }[] = [
  { id: 'review', name: '内容审核', desc: '作品墙 UGC 队列' },
  { id: 'assets', name: '素材库', desc: '来源与授权清单' },
  { id: 'labels', name: 'AI 标识', desc: '标识点位配置' },
  { id: 'logs', name: '操作日志', desc: '全过程留痕' },
];

const ASSETS = [
  {
    name: '汉字—西夏文对照库',
    type: '数据',
    spec: '3117 个汉字 · 10528 条候选 · 5810 个西夏字',
    source: '开源项目 open-tangut（数据源自古今文字集成 CCAMC 与维基词典，释义参照李范文《夏汉字典》）',
    license: 'MIT 许可',
  },
  {
    name: 'Noto Serif Tangut 子集字体',
    type: '字体',
    spec: '5810 字子集 · WOFF · 约 1.4 MB',
    source: 'Google Noto Fonts，经 pyftsubset 子集化',
    license: 'SIL OFL 1.1',
  },
  {
    name: '今昔对照影像',
    type: '图像',
    spec: '8 幅 · 1536×1024 · 今/昔各 4 组',
    source: '本站 AI 生成管线（现状图 → 参考图链式生成复原图），提示词与筛选记录存档于参赛材料',
    license: 'AI 生成 · 原图自带「AI生成」水印',
  },
  {
    name: '西夏文化问答库',
    type: '文本',
    spec: '20 条 · 帝陵/天书/王朝/珍宝四类',
    source: '整理自新华社、光明网、中国社会科学网、宁夏博物馆等公开资料',
    license: '逐条注明来源',
  },
  {
    name: '主题展样例作品',
    type: '生成内容',
    spec: '8 件 · 碑刻/朱文/鎏金三模板',
    source: '由本站对照库默认候选生成',
    license: 'AI 辅助生成 · 已标识',
  },
];

const fmtTime = (ts: number) =>
  new Date(ts).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

function StatusChip({ status }: { status: WallWork['status'] }) {
  return status === 'pending' ? (
    <span className="border border-[hsl(var(--gilt))] px-1.5 py-0.5 text-xs tracking-widest text-[hsl(var(--gilt))]">
      待审核
    </span>
  ) : (
    <span className="border border-[hsl(var(--glaze))] px-1.5 py-0.5 text-xs tracking-widest text-[hsl(var(--glaze))]">
      已通过
    </span>
  );
}

export default function Admin() {
  const [tab, setTab] = useState<Tab>('review');
  const [works, setWorks] = useState<WallWork[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [cfg, setCfg] = useState<AdminConfig>({ showHeaderBadge: true });
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const refresh = useCallback(() => {
    setWorks(loadWorks());
    setLogs(loadLogs());
    setCfg(loadConfig());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener(WALL_EVENT, refresh);
    window.addEventListener(ADMIN_EVENT, refresh);
    return () => {
      window.removeEventListener(WALL_EVENT, refresh);
      window.removeEventListener(ADMIN_EVENT, refresh);
    };
  }, [refresh]);

  const pendingCount = works.filter((w) => w.status === 'pending').length;
  const shownWorks = works.filter((w) => filter === 'all' || w.status === filter);

  const stats = [
    { k: '收录汉字', v: '3117' },
    { k: '问答条目', v: '20' },
    { k: '共创作品', v: String(works.length) },
    { k: '待审核', v: String(pendingCount), warn: pendingCount > 0 },
  ];

  return (
    <div className="min-h-dvh">
      {/* 页眉 */}
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-3">
          <span className="seal-badge h-10 w-10 text-lg font-bold" aria-hidden>
            管
          </span>
          <span className="font-serif-cjk text-xl tracking-[0.3em]">管理后台</span>
          <span className="border border-border px-2 py-0.5 text-xs tracking-widest text-muted-foreground">
            演示 · 数据仅存本机
          </span>
        </div>
        <Link
          to="/"
          className="border border-border px-3 py-1.5 text-sm tracking-widest transition-colors hover:border-[hsl(var(--seal))] hover:text-[hsl(var(--seal))]"
        >
          ← 返回前台
        </Link>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 pb-24">
        <p className="mb-6 text-sm leading-7 text-muted-foreground">
          本页演示参赛方案中的「横切合规层」：素材清单化管理、AI 生成内容标识配置、UGC 内容审核与全过程操作日志。
          所有数据保存在本浏览器（localStorage）；正式版接入平台数据库与账号体系，见参赛文档。
        </p>

        {/* 概览 */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.k} className="border border-border bg-card/70 px-4 py-3 text-center">
              <p className={`font-serif-cjk text-2xl ${s.warn ? 'text-[hsl(var(--gilt))]' : ''}`}>{s.v}</p>
              <p className="mt-1 text-xs tracking-widest text-muted-foreground">{s.k}</p>
            </div>
          ))}
        </div>

        {/* 页签 */}
        <div className="mb-6 flex flex-wrap gap-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`cursor-pointer border px-5 py-2.5 font-serif-cjk tracking-[0.2em] transition-colors ${
                tab === t.id
                  ? 'border-[hsl(var(--seal))] bg-[hsl(var(--seal))] text-white'
                  : 'border-border hover:border-[hsl(var(--seal))] hover:text-[hsl(var(--seal))]'
              }`}
            >
              {t.name}
              <span className={`ml-2 text-xs ${tab === t.id ? 'text-white/75' : 'text-muted-foreground'}`}>
                {t.desc}
              </span>
              {t.id === 'review' && pendingCount > 0 && (
                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[hsl(var(--gilt))]" aria-label="有待审核内容" />
              )}
            </button>
          ))}
        </div>

        {/* 内容审核 */}
        {tab === 'review' && (
          <div>
            <div className="mb-4 flex gap-2">
              {(
                [
                  ['all', '全部'],
                  ['pending', '待审核'],
                  ['approved', '已通过'],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`cursor-pointer border px-3 py-1 text-sm transition-colors ${
                    filter === k
                      ? 'border-[hsl(var(--seal))] text-[hsl(var(--seal))]'
                      : 'border-border text-muted-foreground hover:border-[hsl(var(--seal))]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {shownWorks.length === 0 ? (
              <div className="border border-dashed border-border bg-card/40 px-6 py-10 text-center text-sm text-muted-foreground">
                {works.length === 0
                  ? '暂无用户作品。到前台「天书卡片工坊」生成并挂上作品墙后，这里会出现审核队列。'
                  : '该状态下暂无作品。'}
              </div>
            ) : (
              <ul className="space-y-3">
                {shownWorks.map((w) => (
                  <li key={w.id} className="flex flex-wrap items-center gap-4 border border-border bg-card/70 px-4 py-3">
                    <span className="font-tangut text-2xl tracking-[0.15em]" lang="txg">
                      {w.tangut}
                    </span>
                    <span className="font-serif-cjk tracking-[0.1em]">{w.han}</span>
                    <span className="text-xs text-muted-foreground">
                      {{ stele: '碑刻卡', seal: '朱文印章卡', gilt: '鎏金书签卡' }[w.template]} · {fmtTime(w.ts)}
                    </span>
                    <StatusChip status={w.status} />
                    <span className="ml-auto flex gap-2">
                      {w.status === 'pending' && (
                        <button
                          onClick={() => approveWork(w.id)}
                          className="cursor-pointer border border-[hsl(var(--glaze))] px-3 py-1 text-sm text-[hsl(var(--glaze))] transition-colors hover:bg-[hsl(var(--glaze))] hover:text-white"
                        >
                          通过
                        </button>
                      )}
                      <button
                        onClick={() => removeWork(w.id, '本机管理员')}
                        className="cursor-pointer border border-[hsl(var(--seal))] px-3 py-1 text-sm text-[hsl(var(--seal))] transition-colors hover:bg-[hsl(var(--seal))] hover:text-white"
                      >
                        撤下
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs leading-6 text-muted-foreground">
              演示逻辑：作品挂上墙后先标记「待审核」并在前台加注标识，审核通过后标识移除；「撤下」立即从作品墙移除并写入日志。
            </p>
          </div>
        )}

        {/* 素材库 */}
        {tab === 'assets' && (
          <div className="overflow-x-auto border border-border bg-card/70">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs tracking-widest text-muted-foreground">
                  <th className="px-4 py-3 font-normal">素材</th>
                  <th className="px-4 py-3 font-normal">类型</th>
                  <th className="px-4 py-3 font-normal">规格</th>
                  <th className="px-4 py-3 font-normal">来源</th>
                  <th className="px-4 py-3 font-normal">授权 / 标识</th>
                </tr>
              </thead>
              <tbody>
                {ASSETS.map((a) => (
                  <tr key={a.name} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-serif-cjk">{a.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.type}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.spec}</td>
                    <td className="px-4 py-3 leading-6 text-foreground/75">{a.source}</td>
                    <td className="px-4 py-3 text-[hsl(var(--glaze))]">{a.license}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* AI 标识配置 */}
        {tab === 'labels' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 border border-border bg-card/70 px-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-serif-cjk tracking-[0.1em]">页眉「AI 辅助生成内容已标识」横幅</p>
                <p className="mt-1 text-xs text-muted-foreground">前台页眉右侧的显著标识，可在此关闭演示对比效果</p>
              </div>
              <button
                role="switch"
                aria-checked={cfg.showHeaderBadge}
                onClick={() => {
                  const next = { ...cfg, showHeaderBadge: !cfg.showHeaderBadge };
                  saveConfig(next);
                  logAction('修改标识配置', `页眉标识横幅 → ${next.showHeaderBadge ? '开启' : '关闭'}`, '本机管理员');
                }}
                className={`cursor-pointer border px-4 py-1.5 text-sm tracking-widest transition-colors ${
                  cfg.showHeaderBadge
                    ? 'border-[hsl(var(--glaze))] bg-[hsl(var(--glaze))] text-white'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {cfg.showHeaderBadge ? '已开启' : '已关闭'}
              </button>
            </div>
            {[
              ['成品卡「AI 辅助生成 · 非学术释读」水印', '绘制时写入卡片底部，随 PNG 导出'],
              ['复原影像「AI生成」水印', '由图像生成平台嵌入原图左下角'],
              ['转写结果「对应转写非学术释读」声明', '随结果区固定展示'],
              ['问答模块「预设问答库」性质声明', '模块底部固定展示'],
            ].map(([name, desc]) => (
              <div key={name} className="flex flex-wrap items-center gap-3 border border-border bg-card/40 px-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-serif-cjk tracking-[0.1em]">{name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
                </div>
                <span className="border border-border px-4 py-1.5 text-sm tracking-widest text-muted-foreground">
                  常开 · 合规必需
                </span>
              </div>
            ))}
            <p className="text-xs leading-6 text-muted-foreground">
              设计原则：可对比演示的标识允许开关，涉及合规底线的标识一律锁定常开。
            </p>
          </div>
        )}

        {/* 操作日志 */}
        {tab === 'logs' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">共 {logs.length} 条 · 最新在前</p>
              <button
                onClick={clearLogs}
                className="cursor-pointer border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-[hsl(var(--seal))] hover:text-[hsl(var(--seal))]"
              >
                清空日志
              </button>
            </div>
            {logs.length === 0 ? (
              <div className="border border-dashed border-border bg-card/40 px-6 py-10 text-center text-sm text-muted-foreground">
                暂无日志。挂作品、审核、改配置都会在这里留痕。
              </div>
            ) : (
              <ul className="border border-border bg-card/70">
                {logs.map((l, i) => (
                  <li
                    key={`${l.ts}-${i}`}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border/60 px-4 py-2.5 text-sm last:border-0"
                  >
                    <span className="text-xs text-muted-foreground">{fmtTime(l.ts)}</span>
                    <span className="border border-border px-1.5 py-0.5 text-xs tracking-widest text-muted-foreground">
                      {l.who}
                    </span>
                    <span className="font-serif-cjk">{l.action}</span>
                    <span className="text-foreground/70">{l.detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
