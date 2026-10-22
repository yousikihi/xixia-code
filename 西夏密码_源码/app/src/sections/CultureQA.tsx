import { useMemo, useState } from 'react';

interface QAItem {
  cat: string;
  q: string;
  a: string;
  src: string;
  kw: string[];
}

const CATS = ['全部', '帝陵', '天书', '王朝', '珍宝'] as const;

const QAS: QAItem[] = [
  // —— 帝陵 ——
  {
    cat: '帝陵',
    q: '西夏陵在哪里？',
    a: '宁夏银川市西郊、贺兰山东麓的洪积扇上，西依贺兰山，东望黄河平原。9 座帝陵与 271 座陪葬墓错落分布近 40 平方公里，另有北端建筑遗址与 32 处防洪工程遗址。',
    src: '新华社等公开报道',
    kw: ['哪里', '位置', '地址', '银川', '贺兰山', '多大', '面积', '规模', '几座'],
  },
  {
    cat: '帝陵',
    q: '西夏陵什么时候成为世界遗产？',
    a: '2025 年 7 月 11 日，在法国巴黎召开的联合国教科文组织第 47 届世界遗产大会通过决议，将「西夏陵」列入《世界遗产名录》，成为中国第 60 项世界遗产。',
    src: '新华社',
    kw: ['世界遗产', '申遗', '联合国', '什么时候', '2025', '名录'],
  },
  {
    cat: '帝陵',
    q: '3 号陵是谁的墓？',
    a: '学界主流推测为西夏开国皇帝李元昊之陵，因为它是地面遗存最完整、规模最大的帝陵。但请注意：9 座帝陵中仅 7 号陵由残碑确证墓主，「3 号陵属李元昊」至今仍是推测，未有定论。',
    src: '综合公开报道',
    kw: ['3号陵', '三号陵', '泰陵', '李元昊', '谁的', '墓主', '昊王'],
  },
  {
    cat: '帝陵',
    q: '陵塔为什么千年不倒？',
    a: '奥秘在夯土里的木质「栣木」——它像今天的钢筋一样拉结土体，让八角陵台历经千年风沙与多次地震仍屹立。陵台高达 20 余米，是陵区最醒目的地面遗存。',
    src: '人民画报·考古队员访谈',
    kw: ['不倒', '千年', '栣木', '夯土', '地震', '陵台', '多高'],
  },
  {
    cat: '帝陵',
    q: '陵塔原来长什么样？',
    a: '今天看到的「土包」并非原貌。研究认为陵台原为楼阁式佛塔：层级取五、七、九等单数（契合佛教「单数为吉」），木构出檐满铺绿釉琉璃，脊上装饰鸱吻与人首鸟身的妙音鸟。',
    src: '综合公开报道',
    kw: ['原来', '原貌', '复原', '土包', '佛塔', '琉璃', '楼阁'],
  },
  {
    cat: '帝陵',
    q: '墓室就在陵塔正下方吗？',
    a: '不是。西夏陵的墓室位于陵塔前方，高大的陵塔其实立在墓室后方——这与中原帝陵「封土压墓」的做法明显不同，是承袭唐宋陵制又加以创新的例证。',
    src: '中国社会科学网等',
    kw: ['墓室', '地宫', '下面', '封土', '盗'],
  },
  {
    cat: '帝陵',
    q: '「天子三出阙」是什么？',
    a: '阙是立于城门、宫门前的礼制性楼观，「三出阙」为帝王专用的最高规格。3 号陵陵城的城门与角阙即采用天子三出阙，完全符合中原文化的帝王规制。',
    src: '中国社会科学网',
    kw: ['阙', '三出阙', '城门', '礼制', '规制'],
  },
  // —— 天书（西夏文）——
  {
    cat: '天书',
    q: '西夏文是谁创造的？',
    a: '西夏开国皇帝李元昊命大臣野利仁荣主持创制，公元 1036 年（西夏大庆元年）颁行，时称「番书」「番文」，在西夏境内与汉文并行使用。',
    src: '公开学术资料',
    kw: ['谁', '创造', '创制', '野利仁荣', '李元昊', '发明', '颁行'],
  },
  {
    cat: '天书',
    q: '西夏文一共有多少字？',
    a: '六千余字。李范文主编的《夏汉字典》收录 6000 余字，是目前最完备的工具书；本平台转写库即依据该字典等公开学术成果整理，覆盖 3117 个常用汉字的对应用字。',
    src: '李范文《夏汉字典》',
    kw: ['多少', '字数', '六千', '字典', '夏汉字典', '李范文'],
  },
  {
    cat: '天书',
    q: '西夏文为什么看起来像汉字？',
    a: '西夏文创制时借鉴了汉字构形：同样以横竖撇捺组字，同样有偏旁部首与会意、形声之法，但六千余字「无一字与汉字相同」。笔画普遍繁复，乍一看熟悉，细看一个也不认识。',
    src: '公开学术资料',
    kw: ['像汉字', '为什么像', '偏旁', '笔画', '造字', '形声', '会意'],
  },
  {
    cat: '天书',
    q: '西夏文是怎么被破译的？',
    a: '关键钥匙是黑水城出土的《番汉合时掌中珠》——西夏人骨勒茂才于 1190 年编纂的西夏文—汉文双语词典，逐字对音释义。20 世纪以来，学者藉此与大量文献逐字考释，让「天书」重获生命。',
    src: '公开学术资料',
    kw: ['破译', '解读', '掌中珠', '番汉合时掌中珠', '黑水城', '骨勒茂才', '钥匙'],
  },
  {
    cat: '天书',
    q: '西夏文现在还有人懂吗？',
    a: '作为日常文字它已随西夏灭亡而消亡，被称为「死文字」；但在学术意义上它并未死去——中国、俄罗斯、日本等国学者持续研究，已能释读大部分文献。本站的转写器正是基于这些公开成果。',
    src: '综合公开资料',
    kw: ['还有人懂', '死文字', '失传', '消亡', '活着', '认识'],
  },
  {
    cat: '天书',
    q: '你们的西夏文转写准确吗？',
    a: '本站为文化传播类「对应转写」：依据开源 open-tangut 项目整理的汉字—西夏文对照数据（源自古今文字集成与维基词典，释义参照《夏汉字典》），按字对音给出候选，不构成学术释读。学术研究请以专业文献为准。',
    src: '本站数据与字体来源声明',
    kw: ['准确', '准吗', '靠谱', '转写', '翻译', '学术', '来源'],
  },
  // —— 王朝 ——
  {
    cat: '王朝',
    q: '西夏王朝存在了多少年？',
    a: '公元 1038 年李元昊称帝建国，国号「大夏」，1227 年为蒙古所灭，立国 189 年、传十帝。因地处中原王朝以西，史称「西夏」。',
    src: '公开史料',
    kw: ['多少年', '存在', '多久', '1038', '1227', '灭亡', '蒙古', '建国', '历史'],
  },
  {
    cat: '王朝',
    q: '西夏人是哪个民族？',
    a: '以党项族为主体。党项为古代羌族的一支，唐末五代逐渐壮大，其首领曾获唐赐李姓、宋赐赵姓。西夏境内还有汉、回鹘、吐蕃等众多民族共同生活。',
    src: '公开史料',
    kw: ['民族', '党项', '羌', '什么人', '拓跋'],
  },
  {
    cat: '王朝',
    q: '西夏与宋、辽是什么关系？',
    a: '鼎立之势：西夏先后与北宋、辽，南宋、金并立近两百年，时战时和。它雄踞丝路要道，在多元文化交流中扮演重要角色——这也是西夏陵列入世界遗产的核心价值之一。',
    src: '综合公开报道',
    kw: ['宋朝', '北宋', '辽', '金', '关系', '战争', '丝绸之路', '丝路'],
  },
  // —— 珍宝 ——
  {
    cat: '珍宝',
    q: '「妙音鸟」是什么？',
    a: '梵语「迦陵频伽」，人首鸟身、传说鸣声极美的神鸟。3 号陵陵塔遗址出土的绿釉妙音鸟高近半米、双手合十，是置于垂脊之上的脊兽，地位相当于中原建筑脊兽中的「骑凤仙人」。',
    src: '新华社等公开报道',
    kw: ['妙音鸟', '迦陵频伽', '鸟', '脊兽', '绿釉', '陶'],
  },
  {
    cat: '珍宝',
    q: '最大的鸱吻有多大？',
    a: '6 号陵出土的绿釉鸱吻通高 152 厘米，龙首鱼尾、釉面莹润，是目前国内已知最大的琉璃鸱吻。鸱吻置于正脊两端，传说能吞火镇宅。',
    src: '公开报道',
    kw: ['鸱吻', '152', '最大', '龙首鱼尾', '琉璃'],
  },
  {
    cat: '珍宝',
    q: '鎏金铜牛为什么有名？',
    a: '1977 年出土于陵区陪葬墓，重达 188 公斤，空心浇铸、通体鎏金，是西夏金属铸造工艺的巅峰之作，也是宁夏博物馆的「镇馆之宝」之一。',
    src: '宁夏博物馆公开资料',
    kw: ['铜牛', '鎏金', '188', '镇馆之宝', '博物馆'],
  },
  {
    cat: '珍宝',
    q: '西夏碑为什么不用龟趺驮碑？',
    a: '中原碑刻多以龟趺（石龟）驮碑，西夏碑亭则改用石雕力士跪姿驮碑——融合唐宋佛教石刻中的力士形象，肌肉虬结、神态威猛。陵区已出土多件这样的力士碑座。',
    src: '综合公开报道',
    kw: ['龟趺', '驮碑', '力士', '碑座', '支座', '石碑'],
  },
];

/** 提取连续汉字/字母的二元组用于匹配 */
function bigrams(s: string): string[] {
  const t = s.replace(/[^一-鿿a-zA-Z0-9]/g, '');
  const out: string[] = [];
  for (let i = 0; i < t.length - 1; i++) out.push(t.slice(i, i + 2));
  return out;
}

function score(item: QAItem, query: string): number {
  const q = query.trim();
  if (!q) return 0;
  let s = 0;
  for (const kw of item.kw) {
    if (q.includes(kw)) s += 4 + kw.length * 2;
  }
  for (const bg of bigrams(q)) {
    if (bg.length < 2) continue;
    if (item.q.includes(bg)) s += 2;
    else if (item.a.includes(bg)) s += 1;
  }
  return s;
}

const SUGGESTIONS = [
  '西夏陵在哪里？',
  '陵塔为什么千年不倒？',
  '西夏文是谁创造的？',
  '妙音鸟是什么？',
  '西夏文现在还有人懂吗？',
];

export default function CultureQA() {
  const [cat, setCat] = useState<(typeof CATS)[number]>('全部');
  const [input, setInput] = useState('');
  const [query, setQuery] = useState(''); // 已提交的检索词

  const results = useMemo(() => {
    if (query) {
      return QAS.map((it) => ({ it, s: score(it, query) }))
        .filter((x) => x.s >= 4)
        .sort((a, b) => b.s - a.s)
        .slice(0, 4)
        .map((x) => x.it);
    }
    return cat === '全部' ? QAS : QAS.filter((it) => it.cat === cat);
  }, [cat, query]);

  const ask = (q: string) => {
    const t = q.trim();
    if (!t) return;
    setInput(t);
    setQuery(t);
  };

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-24">
      <div className="mb-6 text-center">
        <h2 className="font-serif-cjk text-2xl tracking-[0.25em]">西夏文化问答</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          已收录 {QAS.length} 条 · 依据公开资料整理，答案注明来源
        </p>
      </div>

      {/* 提问框 */}
      <div className="stele-frame bg-card/60 p-4 sm:p-6">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask(input)}
            placeholder="输入问题或关键词，如「妙音鸟」「陵塔为什么千年不倒」"
            aria-label="输入问题或关键词"
            className="min-w-0 flex-1 border border-border bg-background px-4 py-3 text-base outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-[hsl(var(--seal))]"
          />
          <button
            onClick={() => ask(input)}
            className="shrink-0 cursor-pointer bg-[hsl(var(--seal))] px-6 py-3 font-serif-cjk tracking-[0.25em] text-white transition-all hover:bg-[hsl(14_58%_36%)] active:scale-[0.98]"
          >
            问一问
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">试试：</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="cursor-pointer border border-border px-2.5 py-1 text-xs text-foreground/75 transition-colors hover:border-[hsl(var(--seal))] hover:text-[hsl(var(--seal))]"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 分类 / 检索状态 */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCat(c);
                setQuery('');
                setInput('');
              }}
              className={`cursor-pointer border px-4 py-1.5 font-serif-cjk text-sm tracking-[0.2em] transition-colors ${
                !query && cat === c
                  ? 'border-[hsl(var(--seal))] bg-[hsl(var(--seal))] text-white'
                  : 'border-border hover:border-[hsl(var(--seal))] hover:text-[hsl(var(--seal))]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setInput('');
            }}
            className="cursor-pointer text-sm text-[hsl(var(--seal))] underline-offset-4 hover:underline"
          >
            清除检索，浏览全部
          </button>
        )}
      </div>

      {/* 结果 */}
      <div className="mt-4">
        {query && (
          <p className="mb-3 text-sm text-muted-foreground">
            关于「{query}」{results.length > 0 ? `为你找到 ${results.length} 条相关问答：` : ''}
          </p>
        )}
        {results.length === 0 ? (
          <div className="border border-dashed border-border bg-card/40 px-6 py-10 text-center">
            <p className="font-serif-cjk tracking-[0.15em] text-foreground/80">这个问题暂未收录</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              换个关键词试试，或按分类浏览上方问答库；
              <br />
              接入大模型检索增强问答（RAG）的完整方案见参赛文档。
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {results.map((it) => (
              <article key={it.q} className="border border-border bg-card/70 p-5">
                <header className="flex items-start gap-2.5">
                  <span className="seal-badge mt-0.5 h-6 w-6 shrink-0 text-xs" aria-hidden>
                    问
                  </span>
                  <h3 className="font-serif-cjk leading-7 tracking-[0.05em]">{it.q}</h3>
                </header>
                <p className="mt-3 text-sm leading-7 text-foreground/75">{it.a}</p>
                <footer className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <span>来源：{it.src}</span>
                  <span className="border border-border px-1.5 py-0.5 tracking-widest">{it.cat}</span>
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>

      <p className="mt-6 text-xs leading-6 text-muted-foreground">
        本模块为预设问答库（非实时大模型对话），内容整理自新华社、光明网、中国社会科学网等公开报道与公开学术资料；
        完整方案为「知识库切片 + 向量检索 + 大模型生成」的 RAG 问答，详见参赛文档。
      </p>
    </section>
  );
}
