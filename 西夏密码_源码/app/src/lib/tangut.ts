export interface TangutCandidate {
  t: string;      // 西夏文字符
  cp: string;     // Unicode 码位
  r: string;      // 李范文拟音
  homo: string;   // 直音字（音某）
  m: string;      // 释义
  strokes: number;// 笔画数
  w: number;      // 匹配权重（内部排序用）
}

export type TangutIndex = Record<string, TangutCandidate[]>;

let cache: Promise<TangutIndex> | null = null;

export function loadTangutIndex(): Promise<TangutIndex> {
  if (!cache) {
    cache = fetch('/data/tangut_index.json').then((res) => {
      if (!res.ok) throw new Error('对照库加载失败');
      return res.json() as Promise<TangutIndex>;
    });
  }
  return cache;
}

/** 提取输入中的汉字（CJK 统一表意文字） */
export function extractHan(input: string): string[] {
  return Array.from(input).filter((ch) => /[一-鿿]/.test(ch));
}

/**
 * 李范文拟音调号转声调符号：调 1（平声）→ 横调 ā，调 2（上声）→ 升调 á。
 * 落点规则：优先落在「干净元音」（无组合符）上，顺序 a/e/o 优先、否则取末位元音；
 * 所有元音都带组合符（如 ã、u̱）时退而求其次，避免符号堆叠成乱码。
 */
const TONE_MARK: Record<string, string> = { '1': '̄', '2': '́' };
const VOWEL_SET = new Set(['a', 'e', 'i', 'o', 'u', 'v', 'y', 'ɨ', 'ə', 'ɛ', 'ɔ']);
const VOWEL_PRIORITY = ['a', 'e', 'o', 'ə', 'ɔ'];

export function formatReading(raw: string): string {
  const m = raw.match(/^(.*?)([12])$/);
  if (!m) return raw;
  const [, body, tone] = m;
  const mark = TONE_MARK[tone];
  const chars = Array.from(body);
  const isCombining = (ch: string) => /\p{Mn}/u.test(ch);

  const vowelIdxs: number[] = [];
  chars.forEach((ch, i) => {
    if (VOWEL_SET.has(ch)) vowelIdxs.push(i);
  });
  if (vowelIdxs.length === 0) return raw;

  const clean = vowelIdxs.filter((i) => !(i + 1 < chars.length && isCombining(chars[i + 1])));
  const pool = clean.length > 0 ? clean : vowelIdxs;

  let target = pool[pool.length - 1];
  for (const v of VOWEL_PRIORITY) {
    const hit = pool.find((i) => chars[i] === v);
    if (hit !== undefined) {
      target = hit;
      break;
    }
  }

  let pos = target + 1;
  while (pos < chars.length && chars[pos] === '̱') pos++;
  return chars.slice(0, pos).join('') + mark + chars.slice(pos).join('');
}

export interface TranscribedItem {
  han: string;
  candidates: TangutCandidate[]; // 空数组 = 未收录
  selected: number;
}
