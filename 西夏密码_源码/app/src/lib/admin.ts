/** 演示后台的本地存储：操作日志 + AI 标识配置（仅本浏览器） */

export interface AdminLog {
  ts: number;
  who: string;
  action: string;
  detail: string;
}

export interface AdminConfig {
  /** 页眉「AI 辅助生成内容已标识」横幅 */
  showHeaderBadge: boolean;
}

const LOG_KEY = 'xixia-admin-log';
const CFG_KEY = 'xixia-admin-config';
export const ADMIN_EVENT = 'xixia-admin-changed';

export function notifyAdmin() {
  window.dispatchEvent(new Event(ADMIN_EVENT));
}

export function loadLogs(): AdminLog[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? (arr as AdminLog[]) : [];
  } catch {
    return [];
  }
}

export function logAction(action: string, detail: string, who = '访客') {
  const logs = loadLogs();
  logs.unshift({ ts: Date.now(), who, action, detail });
  localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, 100)));
  notifyAdmin();
}

export function clearLogs() {
  localStorage.setItem(LOG_KEY, JSON.stringify([]));
  logAction('清空操作日志', '清空全部历史记录', '本机管理员');
}

const DEFAULT_CONFIG: AdminConfig = { showHeaderBadge: true };

export function loadConfig(): AdminConfig {
  try {
    const raw = localStorage.getItem(CFG_KEY);
    return raw ? { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<AdminConfig>) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(c: AdminConfig) {
  localStorage.setItem(CFG_KEY, JSON.stringify(c));
  notifyAdmin();
}
