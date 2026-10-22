/** 共创作品墙的本地存储（仅本浏览器，参赛降级方案） */
import { logAction } from '@/lib/admin';

export type WallTemplate = 'stele' | 'seal' | 'gilt';
export type WorkStatus = 'pending' | 'approved';

export interface WallWork {
  id: string;
  han: string;
  tangut: string;
  template: WallTemplate;
  status: WorkStatus;
  ts: number;
}

const WORKS_KEY = 'xixia-wall-works';
const LIKES_KEY = 'xixia-wall-likes';
export const WALL_EVENT = 'xixia-wall-changed';

function notify() {
  window.dispatchEvent(new Event(WALL_EVENT));
}

export function loadWorks(): WallWork[] {
  try {
    const raw = localStorage.getItem(WORKS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    // 兼容旧数据：无 status 字段视为已通过
    return (arr as Partial<WallWork>[]).map((w) => ({
      ...(w as WallWork),
      status: w.status ?? 'approved',
    }));
  } catch {
    return [];
  }
}

/** 挂上作品墙；同文同模板去重。新作品进入「待审核」状态。返回是否为新加入 */
export function addWork(w: Omit<WallWork, 'id' | 'ts' | 'status'>): boolean {
  const works = loadWorks();
  if (works.some((x) => x.han === w.han && x.template === w.template)) return false;
  works.unshift({
    ...w,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ts: Date.now(),
    status: 'pending',
  });
  localStorage.setItem(WORKS_KEY, JSON.stringify(works.slice(0, 24)));
  logAction('作品挂上墙', `「${w.han}」· ${w.template} · 待审核`);
  notify();
  return true;
}

export function approveWork(id: string) {
  const works = loadWorks();
  const w = works.find((x) => x.id === id);
  if (!w) return;
  w.status = 'approved';
  localStorage.setItem(WORKS_KEY, JSON.stringify(works));
  logAction('审核通过', `「${w.han}」· ${w.template}`, '本机管理员');
  notify();
}

export function removeWork(id: string, who = '访客') {
  const works = loadWorks();
  const w = works.find((x) => x.id === id);
  localStorage.setItem(WORKS_KEY, JSON.stringify(works.filter((x) => x.id !== id)));
  if (w) logAction(who === '访客' ? '作者撤下作品' : '审核撤下作品', `「${w.han}」· ${w.template}`, who);
  notify();
}

export function loadLikes(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function toggleLike(id: string): Record<string, boolean> {
  const likes = loadLikes();
  if (likes[id]) delete likes[id];
  else likes[id] = true;
  localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
  notify();
  return likes;
}
