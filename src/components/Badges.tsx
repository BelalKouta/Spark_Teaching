import { Star } from 'lucide-react';

export function RatingBadge({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const dims = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  const text = size === 'md' ? 'text-sm' : 'text-xs';
  return (
    <span className="inline-flex items-center gap-1 text-gold-200">
      <Star className={`${dims} fill-gold-300 text-gold-300`} />
      <span className={`font-semibold ${text}`}>{rating.toFixed(1)}</span>
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending_verification: {
      label: 'Pending Verification',
      className: 'bg-amber-500/10 text-amber-300 border border-amber-500/30',
    },
    accepted_by_assistant: {
      label: 'Accepted by Assistant',
      className: 'bg-teal-500/10 text-teal-300 border border-teal-500/30',
    },
    declined_by_assistant: {
      label: 'Declined by Assistant',
      className: 'bg-orange-500/10 text-orange-300 border border-orange-500/30',
    },
    confirmed: {
      label: 'Confirmed & Connected',
      className: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30',
    },
    completed: {
      label: 'Completed - Paid Assistant',
      className: 'bg-sky-500/10 text-sky-300 border border-sky-500/30',
    },
    cancelled: {
      label: 'Cancelled - Refunded',
      className: 'bg-rose-500/10 text-rose-300 border border-rose-500/30',
    },
  };
  const c = config[status] ?? config.pending_verification;
  return <span className={`badge ${c.className}`}>{c.label}</span>;
}
