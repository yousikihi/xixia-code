import { useCallback, useEffect, useRef, useState } from 'react';
import type { TranscribedItem } from '@/lib/tangut';
import { addWork } from '@/lib/wall';

/* 与全局 CSS 变量一致的色值（Canvas 无法读变量，此处镜像） */
const C = {
  paper: '#f5f2ef',
  card: '#f9f7f4',
  ink: '#232323',
  seal: '#a6492d',
  gilt: '#b08d3e',
  stone: '#e8e3da',
  muted: '#6f6759',
  border: '#cfc7ba',
};

const SERIF = '"Noto Serif SC","Songti SC","STSong","SimSun","Noto Serif CJK SC",serif';
const TANGUT = '"TangutNoto","Noto Serif Tangut",serif';

type TemplateId = 'stele' | 'seal' | 'gilt';
const TEMPLATES: { id: TemplateId; name: string; desc: string }[] = [
  { id: 'stele', name: '碑刻卡', desc: '宣纸米字格 · 竖版' },
  { id: 'seal', name: '朱文印章卡', desc: '红底白字 · 方形' },
  { id: 'gilt', name: '鎏金书签卡', desc: '墨底金字 · 横版' },
];

interface Props {
  items: TranscribedItem[] | null;
}

interface Glyph {
  t: string;
  han: string;
}

function gridOf(n: number): { cols: number; rows: number } {
  if (n <= 1) return { cols: 1, rows: 1 };
  if (n === 2) return { cols: 2, rows: 1 };
  if (n <= 4) return { cols: 2, rows: 2 };
  if (n <= 6) return { cols: 2, rows: Math.ceil(n / 2) };
  return { cols: 3, rows: Math.ceil(n / 3) };
}

/** 米字格 */
function drawRiceGrid(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + s / 2, y);
  ctx.lineTo(x + s / 2, y + s);
  ctx.moveTo(x, y + s / 2);
  ctx.lineTo(x + s, y + s / 2);
  ctx.moveTo(x, y);
  ctx.lineTo(x + s, y + s);
  ctx.moveTo(x + s, y);
  ctx.lineTo(x, y + s);
  ctx.stroke();
  ctx.restore();
}

/** 印章角标 */
function drawSeal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, ch: string, fontSize: number) {
  ctx.save();
  ctx.fillStyle = C.seal;
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x + 3, y + 3, size - 6, size - 6, 2);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `${fontSize}px ${SERIF}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(ch, x + size / 2, y + size / 2 + fontSize * 0.05);
  ctx.restore();
}

/* ——— 模板一：碑刻卡 1000×1400 ——— */
function drawStele(ctx: CanvasRenderingContext2D, glyphs: Glyph[], hanText: string) {
  const W = 1000, H = 1400;
  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);
  // 纸张斑点
  ctx.save();
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgba(35,35,35,${Math.random() * 0.035})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  ctx.restore();
  // 双线外框
  ctx.strokeStyle = 'rgba(35,35,35,0.65)';
  ctx.lineWidth = 2;
  ctx.strokeRect(34, 34, W - 68, H - 68);
  ctx.strokeStyle = 'rgba(35,35,35,0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(46, 46, W - 92, H - 92);

  // 标题
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `42px ${SERIF}`;
  ctx.fillText('西 夏 密 码', W / 2, 116);
  ctx.font = `22px ${SERIF}`;
  ctx.fillStyle = C.muted;
  ctx.fillText('天 书 · 西 夏 文 转 写', W / 2, 162);
  ctx.fillStyle = C.gilt;
  ctx.fillRect(W / 2 - 60, 192, 120, 2);

  // 字阵
  const n = glyphs.length;
  const { cols, rows } = gridOf(n);
  const areaY = 230, areaW = W - 200, areaH = 880;
  const cell = Math.min(areaW / cols, areaH / rows);
  const gridW = cell * cols, gridH = cell * rows;
  const ox = (W - gridW) / 2, oy = areaY + (areaH - gridH) / 2;
  const fontSize = Math.floor(cell * 0.62);

  glyphs.forEach((g, i) => {
    const cx = ox + (i % cols) * cell;
    const cy = oy + Math.floor(i / cols) * cell;
    drawRiceGrid(ctx, cx + 10, cy + 10, cell - 20, 'rgba(166,73,45,0.12)');
    ctx.strokeStyle = 'rgba(35,35,35,0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx + 10, cy + 10, cell - 20, cell - 20);
    ctx.fillStyle = C.ink;
    ctx.font = `${fontSize}px ${TANGUT}`;
    ctx.fillText(g.t, cx + cell / 2, cy + cell / 2 + fontSize * 0.06);
    drawSeal(ctx, cx + cell - 64, cy + 24, 40, g.han, 22);
  });

  // 底部信息
  const fy = 1180;
  ctx.font = `30px ${SERIF}`;
  ctx.fillStyle = C.muted;
  ctx.fillText(hanText, W / 2, fy);
  ctx.font = `20px ${SERIF}`;
  const today = new Date();
  ctx.fillText(
    `${today.getFullYear()} 年 ${today.getMonth() + 1} 月 ${today.getDate()} 日 · 依公开学术资料对应转写`,
    W / 2,
    fy + 44,
  );
  // AI 标识
  ctx.font = `18px ${SERIF}`;
  ctx.fillStyle = C.seal;
  ctx.fillText('AI 辅助生成 · 非学术释读', W / 2, fy + 78);
}

/* ——— 模板二：朱文印章卡 1000×1000 ——— */
function drawSealCard(ctx: CanvasRenderingContext2D, glyphs: Glyph[], hanText: string) {
  const W = 1000, H = 1000;
  ctx.fillStyle = C.seal;
  ctx.fillRect(0, 0, W, H);
  // 白色双线内框
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 3;
  ctx.strokeRect(44, 44, W - 88, H - 88);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 1;
  ctx.strokeRect(60, 60, W - 120, H - 120);

  const n = glyphs.length;
  const { cols, rows } = gridOf(n);
  const areaY = 110, areaW = W - 220, areaH = H - 300;
  const cell = Math.min(areaW / cols, areaH / rows);
  const gridW = cell * cols, gridH = cell * rows;
  const ox = (W - gridW) / 2, oy = areaY + (areaH - gridH) / 2;
  const fontSize = Math.floor(cell * 0.68);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  glyphs.forEach((g, i) => {
    const cx = ox + (i % cols) * cell;
    const cy = oy + Math.floor(i / cols) * cell;
    ctx.fillStyle = '#ffffff';
    ctx.font = `${fontSize}px ${TANGUT}`;
    ctx.fillText(g.t, cx + cell / 2, cy + cell / 2 + fontSize * 0.06);
  });

  ctx.font = `30px ${SERIF}`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(hanText, W / 2, H - 150);
  ctx.font = `20px ${SERIF}`;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('西 夏 密 码 · AI 辅 助 生 成', W / 2, H - 108);
}

/* ——— 模板三：鎏金书签卡 1400×560 ——— */
function drawGilt(ctx: CanvasRenderingContext2D, glyphs: Glyph[], hanText: string) {
  const W = 1400, H = 560;
  ctx.fillStyle = C.ink;
  ctx.fillRect(0, 0, W, H);
  // 暗角
  const grad = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 800);
  grad.addColorStop(0, 'rgba(255,255,255,0.05)');
  grad.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  // 鎏金双线框
  ctx.strokeStyle = C.gilt;
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, W - 52, H - 52);
  ctx.strokeStyle = 'rgba(176,141,62,0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  const n = glyphs.length;
  const fontSize = Math.min(220, Math.floor((W - 240) / n) - 16);
  const totalW = n * (fontSize + 16) - 16;
  const ox = (W - totalW) / 2;
  const cy = H / 2 - 40;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  glyphs.forEach((g, i) => {
    ctx.fillStyle = C.gilt;
    ctx.font = `${fontSize}px ${TANGUT}`;
    ctx.fillText(g.t, ox + i * (fontSize + 16) + fontSize / 2, cy + fontSize * 0.06);
  });

  ctx.font = `30px ${SERIF}`;
  ctx.fillStyle = 'rgba(245,242,239,0.8)';
  ctx.fillText(hanText, W / 2, H - 130);
  ctx.font = `20px ${SERIF}`;
  ctx.fillStyle = 'rgba(245,242,239,0.45)';
  ctx.fillText('西 夏 密 码 · AI 辅 助 生 成 · 非 学 术 释 读', W / 2, H - 86);
  drawSeal(ctx, W - 110, 70, 52, '夏', 30);
}

export default function CardWorkshop({ items }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [template, setTemplate] = useState<TemplateId>('stele');
  const [ready, setReady] = useState(false);
  const [posted, setPosted] = useState(false);

  const glyphs: Glyph[] =
    items
      ?.filter((it) => it.candidates.length > 0)
      .map((it) => ({ t: it.candidates[it.selected].t, han: it.han })) ?? [];
  const hanText = glyphs.map((g) => g.han).join('');

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || glyphs.length === 0) return;
    // 确保西夏文字体加载完成再绘制
    try {
      await document.fonts.load(`100px TangutNoto`, glyphs[0].t);
    } catch {
      /* 字体加载失败则用系统兜底 */
    }
    const dims = template === 'stele' ? [1000, 1400] : template === 'seal' ? [1000, 1000] : [1400, 560];
    canvas.width = dims[0];
    canvas.height = dims[1];
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (template === 'stele') drawStele(ctx, glyphs, hanText);
    else if (template === 'seal') drawSealCard(ctx, glyphs, hanText);
    else drawGilt(ctx, glyphs, hanText);
    setReady(true);
  }, [template, glyphs, hanText]);

  useEffect(() => {
    setReady(false);
    setPosted(false);
    draw();
  }, [draw]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `西夏密码-天书卡-${TEMPLATES.find((t) => t.id === template)?.name}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    }, 'image/png');
  }

  function postToWall() {
    const tangut = glyphs.map((g) => g.t).join('');
    addWork({ han: hanText, tangut, template });
    setPosted(true);
  }

  if (!items || glyphs.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-24">
      <div className="mb-6 text-center">
        <h2 className="font-serif-cjk text-2xl tracking-[0.25em]">天书卡片工坊</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          将转写结果合成为成品卡，可下载分享 · 已按所选候选实时更新
        </p>
      </div>

      {/* 模板选择 */}
      <div className="mb-6 flex flex-wrap justify-center gap-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTemplate(t.id)}
            className={`cursor-pointer border px-5 py-2.5 font-serif-cjk tracking-[0.2em] transition-colors ${
              template === t.id
                ? 'border-[hsl(var(--seal))] bg-[hsl(var(--seal))] text-white'
                : 'border-border hover:border-[hsl(var(--seal))] hover:text-[hsl(var(--seal))]'
            }`}
          >
            {t.name}
            <span className={`ml-2 text-xs ${template === t.id ? 'text-white/75' : 'text-muted-foreground'}`}>
              {t.desc}
            </span>
          </button>
        ))}
      </div>

      {/* 预览 */}
      <div className="stele-frame mx-auto flex justify-center bg-card/60 p-6">
        <canvas
          ref={canvasRef}
          className="max-h-[560px] max-w-full shadow-[0_2px_16px_rgba(35,35,35,0.15)]"
          style={{ opacity: ready ? 1 : 0.4, transition: 'opacity .3s' }}
        />
      </div>

      <div className="mt-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={download}
            className="cursor-pointer bg-[hsl(var(--seal))] px-10 py-3 font-serif-cjk text-lg tracking-[0.3em] text-white transition-all hover:bg-[hsl(14_58%_36%)] active:scale-[0.98]"
          >
            下载成品卡
          </button>
          <button
            onClick={postToWall}
            disabled={posted}
            className={`cursor-pointer border px-6 py-3 font-serif-cjk tracking-[0.25em] transition-all active:scale-[0.98] ${
              posted
                ? 'cursor-default border-[hsl(var(--glaze))] text-[hsl(var(--glaze))]'
                : 'border-[hsl(var(--seal))] text-[hsl(var(--seal))] hover:bg-[hsl(var(--seal))] hover:text-white'
            }`}
          >
            {posted ? '已挂上作品墙' : '挂上作品墙'}
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {posted ? (
            <>
              已加入下方「共创作品墙 · 我的共创」（仅保存在本浏览器） ·{' '}
              <a href="#wall" className="text-[hsl(var(--seal))] underline-offset-4 hover:underline">
                去看看 ↓
              </a>
            </>
          ) : (
            'PNG 高清图 · 含「AI 辅助生成」标识与转写日期，可直接用于分享与展陈'
          )}
        </p>
      </div>
    </section>
  );
}
