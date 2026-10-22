import { useRef, useState } from 'react';

interface Basis {
  h: string;
  d: string;
}

interface Scene {
  id: string;
  tab: string;
  tabDesc: string;
  title: string;
  subtitle: string;
  basis: Basis[];
}

const SCENES: Scene[] = [
  {
    id: 's1',
    tab: '三号陵 · 陵塔',
    tabDesc: '土台之下，原为宝塔',
    title: '3 号陵 · 陵塔',
    subtitle: '地面遗存最完整的帝陵，墓主推测为西夏开国皇帝李元昊',
    basis: [
      {
        h: '楼阁式佛塔',
        d: '现存八角夯土陵台高 20 余米。研究认为其原为楼阁式佛塔，层级取五、七、九等单数，契合佛教「单数为吉」之制。',
      },
      {
        h: '绿釉琉璃',
        d: '3 号陵陵塔遗址出土绿釉迦陵频伽（妙音鸟），为垂脊神兽之首。复原檐口据此满铺绿釉琉璃，脊上饰鸱吻与妙音鸟。',
      },
      {
        h: '栣木抗震',
        d: '夯土中嵌有木质「栣木」，堪称古代钢筋——这是陵塔历经千年风沙与多次地震仍屹立不倒的奥秘。',
      },
      {
        h: '塔陵合一',
        d: '墓室不在陵台之下，陵塔位于墓室后方；承袭唐宋陵寝制度，又融入佛教信仰与党项习俗。',
      },
    ],
  },
  {
    id: 's2',
    tab: '陵城 · 双阙',
    tabDesc: '天子三出阙',
    title: '陵城 · 天子三出阙',
    subtitle: '帝陵陵城的城门与角阙，采用中原帝王最高礼制',
    basis: [
      {
        h: '天子三出阙',
        d: '3 号陵陵城的城门、角阙采用「天子三出阙」最高礼制，完全符合中原文化的帝王规制。',
      },
      {
        h: '神墙围合',
        d: '陵城由神墙四面围合，墙顶覆瓦、转角设阙。今日地面仅存夯土残基，城垣轮廓仍可辨识。',
      },
      {
        h: '承唐仿宋',
        d: '柱洞显示建筑采用中原传统木构形式，并承袭辽代流行的减柱法与移柱法，使殿内空间更为宽敞。',
      },
      {
        h: '脊上瑞兽',
        d: '6 号陵出土绿釉鸱吻高 152 厘米，为国内已知最大琉璃鸱吻；它与妙音鸟、摩羯、海狮共缀屋脊。',
      },
    ],
  },
  {
    id: 's3',
    tab: '碑亭 · 残碑',
    tabDesc: '力士驮碑，不用龟趺',
    title: '东碑亭 · 力士驮碑',
    subtitle: '汉文与西夏文双语石碑，被称为「民族深度融合的铁证」',
    basis: [
      {
        h: '双语残碑',
        d: '陵区出土残碑近 4000 块，以汉文、西夏文双语镌刻，保存了君主世系、职官制度与宗教信仰等信息。',
      },
      {
        h: '力士碑座',
        d: '西夏碑亭不用中原常见的龟趺，而以石雕力士跪姿驮碑，融合唐宋佛教石刻风格，威严有力。',
      },
      {
        h: '现场同款',
        d: '今日 3 号陵景区以玻璃滤镜透视东碑亭复原轮廓——本馆的 AI 对照与这种实地展示方式同源同理。',
      },
      {
        h: '墓主成谜',
        d: '9 座帝陵中仅 7 号陵由残碑确证墓主，3 号陵墓主为李元昊仍是学界主流推测，未有定论。',
      },
    ],
  },
  {
    id: 's4',
    tab: '贺兰山下 · 全景',
    tabDesc: '四十平方公里陵区',
    title: '贺兰山下 · 帝陵群',
    subtitle: '2025 年列入《世界遗产名录》，成为中国第 60 项世界遗产',
    basis: [
      {
        h: '遗址规模',
        d: '9 座帝陵、271 座陪葬墓、5.03 公顷北端建筑遗址与 32 处防洪工程遗址，分布近 40 平方公里。',
      },
      {
        h: '世界遗产',
        d: '2025 年 7 月 11 日，联合国教科文组织第 47 届世界遗产大会（巴黎）通过决议，将其列入《世界遗产名录》。',
      },
      {
        h: '多元交融',
        d: '空间布局与建筑形制承袭唐宋陵寝制度，融入佛教信仰与党项习俗，见证 11—13 世纪丝路文化交流。',
      },
      {
        h: '因山为势',
        d: '陵园坐落于贺兰山东麓洪积扇上，与峰峦山势交相辉映，共同构成雄伟壮丽的陵区景观。',
      },
    ],
  },
];

/** 今昔滑杆对照 */
function Compare({ id, title }: { id: string; title: string }) {
  const [p, setP] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const clamp = (v: number) => Math.min(96, Math.max(4, v));
  const move = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    setP(clamp(((clientX - r.left) / r.width) * 100));
  };

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={`${title}今昔对照，方向键调节`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(p)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          setP((v) => clamp(v - 5));
          e.preventDefault();
        } else if (e.key === 'ArrowRight') {
          setP((v) => clamp(v + 5));
          e.preventDefault();
        }
      }}
      onPointerDown={(e) => {
        ref.current?.setPointerCapture(e.pointerId);
        move(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons & 1) move(e.clientX);
      }}
      className="relative aspect-[3/2] w-full cursor-ew-resize touch-none select-none overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[hsl(var(--seal))]"
    >
      <img
        src={`/gallery/${id}-now.jpg`}
        alt={`${title}现状影像（AI 生成示意）`}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <img
        src={`/gallery/${id}-past.jpg`}
        alt={`${title}推测原貌（AI 复原想象）`}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 0 0 ${p}%)` }}
      />

      {/* 分界线与手柄 */}
      <div className="absolute inset-y-0" style={{ left: `${p}%` }} aria-hidden>
        <div className="absolute inset-y-0 -left-px w-0.5 bg-white/90 shadow-[0_0_10px_rgba(0,0,0,0.55)]" />
        <div className="absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/90 bg-black/55 text-white backdrop-blur-sm">
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 1 1.5 6 6 11" />
            <path d="m12 1 4.5 5-4.5 5" />
          </svg>
        </div>
      </div>

      {/* 今 / 昔 角标 */}
      <span className="absolute left-3 top-3 bg-black/55 px-2.5 py-1 font-serif-cjk text-sm tracking-[0.2em] text-white backdrop-blur-sm">
        今 · 残迹
      </span>
      <span className="absolute right-3 top-3 bg-[hsl(var(--gilt))]/85 px-2.5 py-1 font-serif-cjk text-sm tracking-[0.2em] text-white backdrop-blur-sm">
        昔 · 推测复原
      </span>
    </div>
  );
}

export default function Gallery() {
  const [sceneId, setSceneId] = useState('s1');
  const scene = SCENES.find((s) => s.id === sceneId) ?? SCENES[0];

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-24">
      <div className="mb-6 text-center">
        <h2 className="font-serif-cjk text-2xl tracking-[0.25em]">今昔对照影像馆</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          拖动分界，看贺兰山下的夯土残迹回到琉璃楼阁 · 复原内容均附考据依据
        </p>
      </div>

      {/* 点位选择 */}
      <div className="mb-6 flex flex-wrap justify-center gap-3">
        {SCENES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSceneId(s.id)}
            className={`cursor-pointer border px-5 py-2.5 font-serif-cjk tracking-[0.2em] transition-colors ${
              sceneId === s.id
                ? 'border-[hsl(var(--seal))] bg-[hsl(var(--seal))] text-white'
                : 'border-border hover:border-[hsl(var(--seal))] hover:text-[hsl(var(--seal))]'
            }`}
          >
            {s.tab}
            <span className={`ml-2 text-xs ${sceneId === s.id ? 'text-white/75' : 'text-muted-foreground'}`}>
              {s.tabDesc}
            </span>
          </button>
        ))}
      </div>

      {/* 对照滑杆 */}
      <div className="stele-frame bg-card/60 p-4 sm:p-6">
        <Compare key={scene.id} id={scene.id} title={scene.title} />
        <p className="mt-3 text-center text-xs text-muted-foreground">
          按住拖动分界，或聚焦后使用 ← → 方向键 · 左侧为现状，右侧为推测原貌
        </p>
      </div>

      {/* 考据依据 */}
      <div className="mt-6 border border-border bg-card/70 p-6">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h3 className="font-serif-cjk text-xl tracking-[0.15em]">{scene.title}</h3>
          <p className="text-sm text-muted-foreground">{scene.subtitle}</p>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {scene.basis.map((b) => (
            <div key={b.h} className="border-l border-[hsl(var(--gilt))] pl-3">
              <p className="font-serif-cjk tracking-[0.1em] text-foreground">◆ {b.h}</p>
              <p className="mt-1 text-sm leading-6 text-foreground/75">{b.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 border-t border-border pt-4 text-xs leading-6 text-muted-foreground">
          「今」「昔」影像均由 AI 生成：现状为依据公开摄影资料生成的示意图，复原为依据上述公开考古资料的推测性想象，
          非学术定论；原始图像左下角自带「AI生成」水印。考据要点整理自新华社、光明网、中国社会科学网等公开报道。
        </p>
      </div>
    </section>
  );
}
