export type ColumnColorKey = 'blue' | 'purple' | 'amber' | 'emerald' | 'rose' | 'indigo' | 'slate';

export interface ColumnColorConfig {
  dotClass: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  label: string;
}

export const COLUMN_COLORS: Record<ColumnColorKey, ColumnColorConfig> = {
  blue: {
    dotClass: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/20',
    textClass: 'text-blue-500',
    label: 'Blue',
  },
  purple: {
    dotClass: 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/20',
    textClass: 'text-purple-500',
    label: 'Purple',
  },
  amber: {
    dotClass: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/20',
    textClass: 'text-amber-500',
    label: 'Orange / Amber',
  },
  emerald: {
    dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/20',
    textClass: 'text-emerald-500',
    label: 'Green',
  },
  rose: {
    dotClass: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    bgClass: 'bg-rose-500/10',
    borderClass: 'border-rose-500/20',
    textClass: 'text-rose-500',
    label: 'Red / Rose',
  },
  indigo: {
    dotClass: 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]',
    bgClass: 'bg-indigo-500/10',
    borderClass: 'border-indigo-500/20',
    textClass: 'text-indigo-500',
    label: 'Indigo',
  },
  slate: {
    dotClass: 'bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.5)]',
    bgClass: 'bg-slate-500/10',
    borderClass: 'border-slate-500/20',
    textClass: 'text-slate-400',
    label: 'Slate',
  },
};

/**
 * Automatically infers status color from column name if not explicitly set
 */
export function getColumnColor(columnName: string, explicitColor?: ColumnColorKey): ColumnColorConfig {
  if (explicitColor && COLUMN_COLORS[explicitColor]) {
    return COLUMN_COLORS[explicitColor];
  }

  const lower = columnName.toLowerCase();
  if (lower.includes('todo') || lower.includes('to do') || lower.includes('backlog') || lower.includes('plan')) {
    return COLUMN_COLORS.blue;
  }
  if (lower.includes('progress') || lower.includes('doing') || lower.includes('develop') || lower.includes('wip')) {
    return COLUMN_COLORS.purple;
  }
  if (lower.includes('review') || lower.includes('qa') || lower.includes('test') || lower.includes('verify')) {
    return COLUMN_COLORS.amber;
  }
  if (lower.includes('done') || lower.includes('complete') || lower.includes('finish') || lower.includes('shipped')) {
    return COLUMN_COLORS.emerald;
  }
  if (lower.includes('block') || lower.includes('hold') || lower.includes('cancel') || lower.includes('reject')) {
    return COLUMN_COLORS.rose;
  }

  return COLUMN_COLORS.indigo;
}

/**
 * Extracts markdown checklist stats from description
 * e.g., "- [x] Done item", "- [ ] Todo item"
 */
export function getChecklistStats(description?: string | null): { total: number; completed: number; percentage: number } | null {
  if (!description) return null;

  const matches = description.match(/- \[[ xX]\]/g);
  if (!matches || matches.length === 0) return null;

  const total = matches.length;
  const completed = (description.match(/- \[[xX]\]/g) || []).length;
  const percentage = Math.round((completed / total) * 100);

  return { total, completed, percentage };
}

/**
 * Formats relative time (e.g., "5m ago", "2h ago", "Yesterday")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

