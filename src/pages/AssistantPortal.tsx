import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { navigate } from '@/lib/router';
import type { Assistant, Booking, BookingStatus } from '@/types';
import {
  GraduationCap, Lock, Mail, LogOut, AlertCircle, RefreshCw,
  Check, X, Clock, Calendar, User, ClipboardList, BookOpen,
} from 'lucide-react';
import { StatusBadge } from '@/components/Badges';

const SESSION_KEY = 'peertutor_assistant_session';

export function AssistantPortalPage() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) !== null
  );
  const [assistantId, setAssistantId] = useState<string | null>(
    () => sessionStorage.getItem(SESSION_KEY)
  );

  if (!authed || !assistantId) {
    return (
      <AssistantLogin
        onAuth={(id) => {
          sessionStorage.setItem(SESSION_KEY, id);
          setAssistantId(id);
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <AssistantDashboard
      assistantId={assistantId}
      onLogout={() => {
        sessionStorage.removeItem(SESSION_KEY);
        setAssistantId(null);
        setAuthed(false);
      }}
    />
  );
}

function AssistantLogin({ onAuth }: { onAuth: (assistantId: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const { data, error: queryError } = await supabase
      .from('assistants')
      .select('id, login_email, login_password')
      .eq('login_email', email.trim().toLowerCase())
      .maybeSingle();

    setLoading(false);

    if (queryError || !data || data.login_password !== password) {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    onAuth(data.id);
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
              <GraduationCap className="h-8 w-8 text-ink-base" strokeWidth={2.5} />
            </div>
            <h1 className="font-display text-2xl font-bold gold-text">
              Teacher Portal
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Log in to view your assigned booking requests.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(false);
                  }}
                  placeholder="teacher1@platform.com"
                  autoFocus
                  className={`input-dark pl-10 ${error ? 'border-rose-500/50' : ''}`}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="Enter your password"
                  className={`input-dark pl-10 ${error ? 'border-rose-500/50' : ''}`}
                />
              </div>
            </div>
            {error && (
              <p className="flex items-center gap-1.5 text-sm text-rose-400">
                <AlertCircle className="h-4 w-4" />
                Invalid email or password. Try again.
              </p>
            )}
            <button type="submit" disabled={loading} className="btn-gold w-full">
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-base/30 border-t-ink-base" />
              ) : (
                <>
                  <GraduationCap className="h-4 w-4" />
                  Log In
                </>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-gray-600">
            Demo: <span className="font-mono text-gold-600">teacher1@platform.com</span> / <span className="font-mono text-gold-600">pass123</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function AssistantDashboard({
  assistantId,
  onLogout,
}: {
  assistantId: string;
  onLogout: () => void;
}) {
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: aData }, { data: bData }] = await Promise.all([
      supabase.from('assistants').select('*').eq('id', assistantId).maybeSingle(),
      supabase
        .from('bookings')
        .select('*')
        .eq('assistant_id', assistantId)
        .order('created_at', { ascending: false }),
    ]);
    if (aData) setAssistant(aData as Assistant);
    if (bData) setBookings(bData as Booking[]);
    setLoading(false);
  }, [assistantId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const STATUS_FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'pending_verification', label: 'Pending' },
    { value: 'accepted_by_assistant', label: 'Accepted' },
    { value: 'declined_by_assistant', label: 'Declined' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
  ];

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const stats = useMemo(() => {
    const pending = bookings.filter(
      (b) => b.status === 'pending_verification'
    ).length;
    const accepted = bookings.filter(
      (b) => b.status === 'accepted_by_assistant' || b.status === 'confirmed'
    ).length;
    const completed = bookings.filter(
      (b) => b.status === 'completed'
    ).length;
    return { pending, accepted, completed, total: bookings.length };
  }, [bookings]);

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {assistant && (
              <img
                src={assistant.photo_url}
                alt={assistant.name}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-gold-600/40"
              />
            )}
            <div>
              <h1 className="font-display text-2xl font-bold gold-text">
                {assistant?.name ?? 'Teacher Dashboard'}
              </h1>
              <p className="text-xs text-gray-500">
                {assistant?.major} · {assistant?.university}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchData} disabled={loading} className="btn-ghost">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={onLogout}
              className="btn-ghost text-rose-300 hover:border-rose-500/40 hover:text-rose-200"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <TeacherStatCard icon={ClipboardList} label="Total Requests" value={stats.total} />
          <TeacherStatCard icon={Clock} label="Pending" value={stats.pending} highlight={stats.pending > 0} />
          <TeacherStatCard icon={Check} label="Accepted" value={stats.accepted} />
          <TeacherStatCard icon={BookOpen} label="Completed" value={stats.completed} />
        </div>

        {/* Filters */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
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

        {/* Requests */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-border border-t-gold-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card-base flex flex-col items-center justify-center py-16 text-center">
              <ClipboardList className="mb-3 h-10 w-10 text-gray-700" />
              <p className="text-sm text-gray-500">No requests assigned to you yet.</p>
            </div>
          ) : (
            filtered.map((b) => (
              <div key={b.id} className="card-base p-5 animate-slide-up">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-sm font-semibold text-gold-200">
                      #{b.booking_code}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-2 text-sm">
                    <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-400" />
                    <div>
                      <div className="text-xs text-gray-500">Student</div>
                      <div className="font-medium text-gray-200">{b.student_name}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-400" />
                    <div>
                      <div className="text-xs text-gray-500">Date & Time</div>
                      <div className="font-medium text-gray-200">
                        {formatDate(b.session_date)} at {b.session_time}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lesson Description */}
                {b.lesson_description && (
                  <div className="mt-3 rounded-xl border border-ink-border bg-ink-raised p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gold-300">
                      <ClipboardList className="h-3.5 w-3.5" />
                      Lesson Description
                    </div>
                    <p className="text-sm leading-relaxed text-gray-400">
                      {b.lesson_description}
                    </p>
                  </div>
                )}

                {/* Teacher Actions */}
                <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-border pt-4">
                  {b.status === 'pending_verification' && (
                    <>
                      <button
                        onClick={() => updateStatus(b.id, 'accepted_by_assistant')}
                        disabled={updating === b.id}
                        className="flex items-center gap-1.5 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-xs font-semibold text-teal-300 transition-all hover:border-teal-500/50 hover:bg-teal-500/15"
                      >
                        {updating === b.id ? (
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border border-teal-300/30 border-t-teal-300" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Accept Request
                      </button>
                      <button
                        onClick={() => updateStatus(b.id, 'declined_by_assistant')}
                        disabled={updating === b.id}
                        className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 transition-all hover:border-rose-500/50 hover:bg-rose-500/15"
                      >
                        {updating === b.id ? (
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border border-rose-300/30 border-t-rose-300" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                        Decline Request
                      </button>
                    </>
                  )}
                  {b.status === 'accepted_by_assistant' && (
                    <div className="flex items-center gap-1.5 text-xs text-teal-300">
                      <Check className="h-3.5 w-3.5" />
                      You accepted this request. Awaiting admin confirmation.
                    </div>
                  )}
                  {b.status === 'declined_by_assistant' && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-300">
                      <X className="h-3.5 w-3.5" />
                      You declined this request. Admin will process a refund.
                    </div>
                  )}
                  {b.status === 'confirmed' && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                      <Check className="h-3.5 w-3.5" />
                      Confirmed & connected. Session is scheduled.
                    </div>
                  )}
                  {b.status === 'completed' && (
                    <div className="flex items-center gap-1.5 text-xs text-sky-300">
                      <BookOpen className="h-3.5 w-3.5" />
                      Session completed. Payout released.
                    </div>
                  )}
                  {b.status === 'cancelled' && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-300">
                      <X className="h-3.5 w-3.5" />
                      This booking was cancelled and refunded.
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TeacherStatCard({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`card-base p-4 transition-all ${
        highlight
          ? 'border-amber-500/40 shadow-gold-glow'
          : 'hover:border-gold-600/30'
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-300/10">
          <Icon className="h-4 w-4 text-gold-300" />
        </div>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className="font-display text-xl font-bold text-gold-200">
        {value}
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
