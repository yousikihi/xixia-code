import { useEffect, useMemo, useState } from 'react';
import {
  extractHan,
  formatReading,
  loadTangutIndex,
  type TangutIndex,
  type TranscribedItem,
} from '@/lib/tangut';

const EXAMPLES = ['我爱宁夏', '平安喜乐', '贺兰山下', '吉祥如意'];
const MAX_LEN = 12;

interface Props {
  items: TranscribedItem[] | null;
  setItems: React.Dispatch<React.SetStateAction<TranscribedItem[] | null>>;
}

export default function Transcriber({ items, setItems }: Props) {
  const [index, setIndex] = useState<TangutIndex | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTangutIndex()
      .then(setIndex)
      .catch(() => setLoadError('对照库加载失败，请刷新重试'));
  }, []);

  const hanCount = useMemo(() => extractHan(input).length, [input]);

  function transcribe(text: string) {
    if (!index) return;
    const hans = extractHan(text).slice(0, MAX_LEN);
    if (hans.length === 0) {
      setItems(null);
      return;
    }
    setItems(
      hans.map((han) => ({
        han,
        candidates: index[han] ?? [],
        selected: 0,
      })),
    );
    setCopied(false);
  }

  function pick(charIdx: number, candIdx: number) {
    setItems((prev) =>
      prev
        ? prev.map((it, i) => (i === charIdx ? { ...it, selected: candIdx } : it))
        : prev,
    );
  }

  const resultString = items
    ? items.map((it) => it.candidates[it.selected]?.t ?? it.han).join('')
    : '';

  async function copyResult() {
    if (!resultString) return;
    try {
      await navigator.clipboard.writeText(resultString);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = resultString;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const covered = items?.filter((it) => it.candidates.length > 0).length ?? 0;

  return (
    <section id="transcriber" className="mx-auto w-full max-w-4xl px-4 pb-24">
      {/* 输入区 */}
      <div className="stele-frame bg-card/80 p-6 sm:p-10">
        <label
          htmlFor="han-input"
          className="mb-3 block font-serif-cjk text-lg tracking-widest text-foreground/80"
        >
          写下汉字 · 还你天书
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="han-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && transcribe(input)}
            placeholder={index ? '输入姓名、祝福或一句话…' : '对照库加载中…'}
            disabled={!index}
            maxLength={20}
            className="h-14 flex-1 border border-input bg-transparent px-4 font-serif-cjk text-xl tracking-[0.2em] outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-[hsl(var(--seal))] disabled:opacity-50"
          />
          <button
            onClick={() => transcribe(input)}
            disabled={!index || hanCount === 0}
            className="h-14 shrink-0 cursor-pointer bg-[hsl(var(--seal))] px-8 font-serif-cjk text-lg tracking-[0.3em] text-white transition-all hover:bg-[hsl(14_58%_36%)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            转 写
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-serif-cjk tracking-widest">试试：</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setInput(ex);
                transcribe(ex);
              }}
              disabled={!index}
              className="cursor-pointer border border-border px-3 py-1 font-serif-cjk tracking-widest transition-colors hover:border-[hsl(var(--seal))] hover:text-[hsl(var(--seal))] disabled:opacity-40"
            >
              {ex}
            </button>
          ))}
          <span className="ml-auto">
            {index
              ? `已收录 ${Object.keys(index).length} 个汉字 · 单次最多 ${MAX_LEN} 字`
              : loadError ?? '加载中…'}
          </span>
        </div>
      </div>

      {/* 结果区 */}
      {items && (
        <div className="mt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-serif-cjk text-2xl tracking-[0.2em]">
              转写结果
              <span className="ml-3 text-sm font-normal tracking-normal text-muted-foreground">
                {covered}/{items.length} 字已转写 · 点击候选可人工换字
              </span>
            </h2>
            <button
              onClick={copyResult}
              disabled={covered === 0}
              className="cursor-pointer border border-foreground/60 px-5 py-2 font-serif-cjk tracking-[0.25em] transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? '已复制 ✓' : '复制西夏文'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {items.map((it, i) => {
              const cand = it.candidates[it.selected];
              return (
                <div key={`${it.han}-${i}`} className="glyph-card">
                  {cand ? (
                    <>
                      {/* 字台：西夏文 + 印章角标 */}
                      <div className="glyph-stage">
                        <span
                          className="font-tangut relative z-10 leading-none text-foreground"
                          style={{ fontSize: 88 }}
                          title={cand.cp}
                        >
                          {cand.t}
                        </span>
                        <span className="seal-corner" title={`源汉字：${it.han}`}>
                          {it.han}
                        </span>
                      </div>

                      {/* 信息区 */}
                      <div className="flex flex-1 flex-col px-4 pb-4 pt-3 text-center">
                        {cand.r ? (
                          <>
                            <div className="font-serif-cjk text-2xl leading-9 tracking-wide">
                              {formatReading(cand.r)}
                            </div>
                            <div className="mt-0.5 min-h-5 text-sm text-muted-foreground">
                              {cand.homo ? `音同「${cand.homo}」` : ''}
                            </div>
                          </>
                        ) : cand.homo ? (
                          <div className="flex min-h-14 flex-col justify-center">
                            <div className="font-serif-cjk text-xl leading-9 tracking-wide text-foreground/85">
                              音同「{cand.homo}」
                            </div>
                          </div>
                        ) : (
                          <div className="flex min-h-14 items-center justify-center">
                            <span className="font-serif-cjk text-xl tracking-wide text-foreground/85">
                              {cand.m || '—'}
                            </span>
                          </div>
                        )}
                        {(cand.r || cand.homo) && (
                          <div className="my-3 flex items-center gap-3">
                            <span className="h-px flex-1 bg-border" />
                            <span className="font-serif-cjk text-base text-foreground/85">
                              {cand.m || '—'}
                            </span>
                            <span className="h-px flex-1 bg-border" />
                          </div>
                        )}
                        <div className="mt-auto text-xs tracking-[0.2em] text-muted-foreground">
                          {cand.strokes} 画 · {cand.cp}
                        </div>
                      </div>

                      {/* 候选条 */}
                      {it.candidates.length > 1 && (
                        <div
                          className="grid border-t border-border"
                          style={{
                            gridTemplateColumns: `repeat(${Math.min(it.candidates.length, 6)}, 1fr)`,
                          }}
                        >
                          {it.candidates.slice(0, 6).map((c, ci) => (
                            <button
                              key={c.cp}
                              onClick={() => pick(i, ci)}
                              aria-label={`候选 ${ci + 1}`}
                              className={`font-tangut glyph-option ${
                                ci === it.selected ? 'glyph-option--on' : ''
                              }`}
                            >
                              {c.t}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="glyph-stage">
                        <span className="font-serif-cjk relative z-10 text-6xl text-muted-foreground/40">
                          {it.han}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 text-center">
                        <p className="font-serif-cjk text-base text-foreground/70">「{it.han}」暂未收录</p>
                        <p className="mt-1 text-sm text-muted-foreground">可换用近义字再试</p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* 结果串 */}
          {covered > 0 && (
            <div className="stele-frame mt-8 bg-card/70 p-6 text-center">
              <div className="mb-2 text-xs tracking-[0.3em] text-muted-foreground">
                转写全文 · 按当前所选候选拼接
              </div>
              <div className="font-tangut break-all text-4xl leading-relaxed tracking-wider sm:text-5xl">
                {resultString}
              </div>
              <div className="mt-3 font-serif-cjk text-lg tracking-[0.4em] text-muted-foreground">
                {items.map((it) => it.han).join('')}
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-xs leading-6 text-muted-foreground">
            转写依据公开学术资料整理的汉字—西夏文对照数据，为对应转写，非学术释读；
            多义字请点击候选人工选定。
          </p>
        </div>
      )}
    </section>
  );
}
