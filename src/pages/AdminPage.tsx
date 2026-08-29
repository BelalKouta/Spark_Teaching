import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { BookingWithAssistant, BookingStatus } from '@/types';
import {
  Shield, Lock, LogOut, DollarSign, CheckCircle2, Clock, XCircle,
  MessageCircle, Check, X, Eye, Search, AlertCircle,
  RefreshCw, Image as ImageIcon, Users, ClipboardList,
} from 'lucide-react';
import { Modal } from '@/components/Modal';
import { StatusBadge } from '@/components/Badges';

const ADMIN_PASSWORD = 'admin123';
const SESSION_KEY = 'peertutor_admin_session';

const STATUS_FILTERS = [
  { value: 'all', label: 'All Requests' },
  { value: 'pending_verification', label: 'Pending Verification' },
  { value: 'accepted_by_assistant', label: 'Accepted by Assistant' },
  { value: 'declined_by_assistant', label: 'Declined by Assistant' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function AdminPage() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === '1'
  );

  if (!authed) {
    return <AdminGate onAuth={() => setAuthed(true)} />;
  }

  return <AdminDashboard onLogout={() => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  }} />;
}

function AdminGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onAuth();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center pt-20 px-4">
      <div className="w-full max-w-md">
        <div
          className={`card-base p-8 ${shake ? 'animate-[shake_0.5s]' : ''}`}
          style={shake ? { animation: 'shake 0.5s' } : undefined}
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-300 to-gold-500 shadow-gold-glow">
              <Shield className="h-8 w-8 text-ink-base" strokeWidth={2.5} />
            </div>
            <h1 className="font-display text-2xl font-bold gold-text">
              Admin Control Panel
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Enter the master password to access the dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Master password"
                autoFocus
                className={`input-dark pl-10 ${error ? 'border-rose-500/50' : ''}`}
              />
            </div>
            {error && (
              <p className="flex items-center gap-1.5 text-sm text-rose-400">
                <AlertCircle className="h-4 w-4" />
                Incorrect password. Try again.
              </p>
            )}
            <button type="submit" className="btn-gold w-full">
              <Shield className="h-4 w-4" />
 Unlock Dashboard
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-600">
            Demo password: <span className="font-mono text-gold-600">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [bookings, setBookings] = useState<BookingWithAssistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [receiptView, setReceiptView] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*, assistant:assistants(*)')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setBookings(data as unknown as BookingWithAssistant[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = async (bookingId: string, status: BookingStatus) => {
    setUpdating(bookingId);
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);
    if (!error) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
    }
    setUpdating(null);
  };

  const stats = useMemo(() => {
    const revenue = bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + b.total_cost, 0);
    const active = bookings.filter(
      (b) =>
        b.status === 'confirmed' ||
        b.status === 'pending_verification' ||
        b.status === 'accepted_by_assistant'
    ).length;
    const pending = bookings.filter(
      (b) => b.status === 'pending_verification'
    ).length;
    const refunded = bookings.filter(
      (b) => b.status === 'cancelled'
    ).length;
    return { revenue, active, pending, refunded };
  }, [bookings]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchesSearch =
        !search ||
        b.booking_code.toLowerCase().includes(search.toLowerCase()) ||
        b.student_name.toLowerCase().includes(search.toLowerCase()) ||
        b.assistant?.name.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, search]);

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold gold-text">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage bookings, verify payments, and connect students with tutors.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="btn-ghost"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button onClick={onLogout} className="btn-ghost text-rose-300 hover:border-rose-500/40 hover:text-rose-200">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={DollarSign}
            label="Revenue Released"
            value={`${stats.revenue} EGP`}
          />
          <StatCard
            icon={Users}
            label="Active Bookings"
            value={stats.active.toString()}
          />
          <StatCard
            icon={Clock}
            label="Pending Verifications"
            value={stats.pending.toString()}
            highlight={stats.pending > 0}
          />
          <StatCard
            icon={XCircle}
            label="Refunded Requests"
            value={stats.refunded.toString()}
          />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-xl border border-ink-border bg-ink-card px-3 py-2.5 flex-1">
            <Search className="h-4 w-4 text-gray-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by booking ID, student, or tutor..."
              className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-medium transition-all ${
                  statusFilter === f.value
                    ? 'bg-gradient-to-r from-gold-300 to-gold-400 text-ink-base shadow-gold-glow'
                    : 'border border-ink-border bg-ink-card text-gray-400 hover:border-gold-600/40 hover:text-gold-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card-base overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-border border-t-gold-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="mb-3 h-10 w-10 text-gray-700" />
              <p className="text-sm text-gray-500">No bookings found.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-ink-border text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-4 py-3 font-medium">Booking ID</th>
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">Tutor</th>
                      <th className="px-4 py-3 font-medium">Date / Time</th>
                      <th className="px-4 py-3 font-medium">Lesson Description</th>
                      <th className="px-4 py-3 font-medium">Payment Ref</th>
                      <th className="px-4 py-3 font-medium">Receipt</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-border">
                    {filtered.map((b) => (
                      <tr
                        key={b.id}
                        className="text-sm transition-colors hover:bg-ink-raised/50"
                      >
                        <td className="px-4 py-4">
                          <span className="font-mono font-semibold text-gold-200">
                            #{b.booking_code}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-200">{b.student_name}</div>
                          <div className="text-xs text-gray-500">{b.student_email}</div>
                          <div className="text-xs text-gray-600">{b.student_phone}</div>
                        </td>
                        <td className="px-4 py-4">
                          {b.assistant ? (
                            <div className="flex items-center gap-2">
                              <img
                                src={b.assistant.photo_url}
                                alt={b.assistant.name}
                                className="h-8 w-8 rounded-full object-cover ring-1 ring-gold-600/30"
                              />
                              <span className="text-gray-300">{b.assistant.name}</span>
                            </div>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-gray-300">
                          <div>{formatDateShort(b.session_date)}</div>
                          <div className="text-xs text-gray-500">{b.session_time}</div>
                        </td>
                        <td className="px-4 py-4 max-w-[200px]">
                          {b.lesson_description ? (
                            <span className="line-clamp-3 text-xs text-gray-400">
                              {b.lesson_description}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono text-xs text-gray-400">
                            {b.payment_ref ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          {b.receipt_url ? (
                            <button
                              onClick={() => setReceiptView(b.receipt_url)}
                              className="flex items-center gap-1.5 text-xs text-gold-200 transition-colors hover:text-gold-100"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                          ) : (
                            <span className="text-xs text-gray-600">No image</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="px-4 py-4">
                          <ActionButtons
                            booking={b}
                            updating={updating === b.id}
                            onUpdate={updateStatus}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-ink-border lg:hidden">
                {filtered.map((b) => (
                  <div key={b.id} className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-mono font-semibold text-gold-200">
                        #{b.booking_code}
                      </span>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="mb-3 space-y-1.5 text-sm">
                      <div>
                        <span className="text-gray-500">Student: </span>
                        <span className="text-gray-200">{b.student_name}</span>
                        <span className="block text-xs text-gray-500">{b.student_email}</span>
                        <span className="block text-xs text-gray-600">{b.student_phone}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tutor: </span>
                        <span className="text-gray-200">{b.assistant?.name ?? '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Session: </span>
                        <span className="text-gray-200">
                          {formatDateShort(b.session_date)} at {b.session_time}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Payment Ref: </span>
                        <span className="font-mono text-xs text-gray-400">
                          {b.payment_ref ?? '—'}
                        </span>
                      </div>
                      {b.lesson_description && (
                        <div className="rounded-lg border border-ink-border bg-ink-raised p-2.5">
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <ClipboardList className="h-3 w-3" />
                            Lesson Description
                          </span>
                          <p className="mt-1 text-xs text-gray-400">{b.lesson_description}</p>
                        </div>
                      )}
                    </div>
                    {b.receipt_url && (
                      <button
                        onClick={() => setReceiptView(b.receipt_url)}
                        className="mb-3 flex items-center gap-1.5 text-xs text-gold-200"
                      >
                        <Eye className="h-4 w-4" />
                        View Receipt
                      </button>
                    )}
                    <ActionButtons
                      booking={b}
                      updating={updating === b.id}
                      onUpdate={updateStatus}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      <Modal open={!!receiptView} onClose={() => setReceiptView(null)} className="max-w-md">
        {receiptView && (
          <div className="p-5">
            <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-gold-100">
              <ImageIcon className="h-5 w-5 text-gold-300" />
              Payment Receipt
            </h3>
            <img
              src={receiptView}
              alt="Payment receipt"
              className="w-full rounded-xl border border-ink-border"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`card-base p-5 transition-all ${
        highlight
          ? 'border-amber-500/40 shadow-gold-glow'
          : 'hover:border-gold-600/30'
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-300/10">
          <Icon className="h-4.5 w-4.5 text-gold-300" />
        </div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className="font-display text-2xl font-bold text-gold-200">
        {value}
      </div>
    </div>
  );
}

function ActionButtons({
  booking,
  updating,
  onUpdate,
}: {
  booking: BookingWithAssistant;
  updating: boolean;
  onUpdate: (id: string, status: BookingStatus) => void;
}) {
  const lessonTopic = booking.lesson_description
    ? booking.lesson_description.split('\n')[0].slice(0, 80)
    : 'their session';

  const waStudent = (b: BookingWithAssistant) => {
    const msg = `Hi ${b.student_name}, received your request for ${b.assistant?.name ?? 'your tutor'} on ${formatDateShort(b.session_date)} regarding "${lessonTopic}". Validating payment...`;
    window.open(
      `https://wa.me/${b.student_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`,
      '_blank'
    );
  };

  const waAssistant = (b: BookingWithAssistant) => {
    if (!b.assistant) return;
    const msg = `Hi ${b.assistant.name}, you have a pending booking request for ${formatDateShort(b.session_date)} at ${b.session_time}. Student: ${b.student_name}. Topic: "${lessonTopic}".`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {/* WhatsApp Student */}
      <button
        onClick={() => waStudent(booking)}
        title="WhatsApp Student"
        className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-300 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/15"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">Student</span>
      </button>

      {/* WhatsApp Assistant */}
      <button
        onClick={() => waAssistant(booking)}
        title="WhatsApp Tutor"
        className="flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1.5 text-xs font-medium text-emerald-400/80 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">Tutor</span>
      </button>

      {/* Approve & Connect — available when pending verification or accepted by assistant */}
      {(booking.status === 'pending_verification' || booking.status === 'accepted_by_assistant') && (
        <button
          onClick={() => onUpdate(booking.id, 'confirmed')}
          disabled={updating}
          title="Approve & Connect"
          className="flex items-center gap-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1.5 text-xs font-medium text-sky-300 transition-all hover:border-sky-500/50 hover:bg-sky-500/15"
        >
          {updating ? (
            <div className="h-3.5 w-3.5 animate-spin rounded-full border border-sky-300/30 border-t-sky-300" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
          <span className="hidden lg:inline">Approve</span>
        </button>
      )}

      {/* Complete & Release */}
      {booking.status === 'confirmed' && (
        <button
          onClick={() => onUpdate(booking.id, 'completed')}
          disabled={updating}
          title="Complete & Release Payout"
          className="flex items-center gap-1 rounded-lg border border-gold-600/40 bg-gold-300/10 px-2.5 py-1.5 text-xs font-medium text-gold-200 transition-all hover:border-gold-500/60 hover:bg-gold-300/15"
        >
          {updating ? (
            <div className="h-3.5 w-3.5 animate-spin rounded-full border border-gold-300/30 border-t-gold-300" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          <span className="hidden lg:inline">Complete</span>
        </button>
      )}

      {/* Cancel & Refund — available for pending, accepted, or confirmed */}
      {(booking.status === 'pending_verification' ||
        booking.status === 'accepted_by_assistant' ||
        booking.status === 'confirmed' ||
        booking.status === 'declined_by_assistant') && (
        <button
          onClick={() => onUpdate(booking.id, 'cancelled')}
          disabled={updating}
          title="Cancel & Process Refund"
          className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-300 transition-all hover:border-rose-500/50 hover:bg-rose-500/15"
        >
          {updating ? (
            <div className="h-3.5 w-3.5 animate-spin rounded-full border border-rose-300/30 border-t-rose-300" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
          <span className="hidden lg:inline">Refund</span>
        </button>
      )}
    </div>
  );
}

function formatDateShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
