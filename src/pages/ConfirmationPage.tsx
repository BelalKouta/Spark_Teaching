import { useEffect, useState } from 'react';
import { useRoute, navigate } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import type { BookingWithAssistant } from '@/types';
import {
  CheckCircle2, MessageCircle, Clock, Calendar, User, ArrowRight, Home,
} from 'lucide-react';

const WHATSAPP_SUPPORT = '201001234567';

export function ConfirmationPage() {
  const route = useRoute();
  const bookingCode =
    route.name === 'confirmation' ? route.bookingCode : '';

  const [booking, setBooking] = useState<BookingWithAssistant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, assistant:assistants(*)')
        .eq('booking_code', bookingCode)
        .maybeSingle();
      if (!error && data) {
        setBooking(data as unknown as BookingWithAssistant);
      }
      setLoading(false);
    })();
  }, [bookingCode]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-border border-t-gold-300" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-20 text-center">
        <p className="text-lg font-medium text-gray-400">Booking not found</p>
        <button onClick={() => navigate('/')} className="btn-gold mt-4">
          Back to Directory
        </button>
      </div>
    );
  }

  const waMessage = encodeURIComponent(
    `Hi, I just submitted booking ${booking.booking_code} for ${booking.assistant?.name ?? 'my tutor'} on ${booking.session_date} at ${booking.session_time}. My payment reference is ${booking.payment_ref ?? 'N/A'}. Please validate my payment.`
  );

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        {/* Success animation */}
        <div className="mb-8 flex flex-col items-center text-center animate-scale-in">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold-400 bg-gold-300/10 shadow-gold-glow-lg">
            <CheckCircle2 className="h-10 w-10 text-gold-300" />
          </div>
          <h1 className="font-display text-3xl font-bold gold-text">
            Booking Submitted!
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Your request is being processed via WhatsApp.
          </p>
        </div>

        {/* Booking card */}
        <div className="card-base overflow-hidden animate-slide-up">
          <div className="border-b border-amber-600/20 bg-ink-raised px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Booking ID</span>
              <span className="font-mono text-lg font-bold text-gold-200">
                #{booking.booking_code}
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {/* Status */}
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <Clock className="h-4 w-4 flex-shrink-0 text-amber-300" />
              <span className="text-sm font-medium text-amber-200">
                Status: Pending Payment Verification
              </span>
            </div>

            {/* Details */}
            <div className="space-y-3">
              {booking.assistant && (
                <div className="flex items-center gap-3 border-b border-ink-border pb-3">
                  <img
                    src={booking.assistant.photo_url}
                    alt={booking.assistant.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-gold-600/30"
                  />
                  <div>
                    <div className="text-xs text-gray-500">Your Tutor</div>
                    <div className="font-semibold text-gold-100">
                      {booking.assistant.name}
                    </div>
                  </div>
                </div>
              )}

              <DetailRow
                icon={Calendar}
                label="Session Date"
                value={formatDate(booking.session_date)}
              />
              <DetailRow
                icon={Clock}
                label="Session Time"
                value={booking.session_time}
              />
              <DetailRow
                icon={User}
                label="Student Name"
                value={booking.student_name}
              />
              <div className="flex items-center justify-between border-t border-amber-600/20 pt-3">
                <span className="text-sm font-medium text-gray-400">Total Paid</span>
                <span className="font-display text-2xl font-bold gold-text">
                  {booking.total_cost} EGP
                </span>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 rounded-xl border border-ink-border bg-ink-raised p-4">
              <h3 className="mb-2 text-sm font-semibold text-gold-100">
                What happens next?
              </h3>
              <ol className="space-y-2 text-sm text-gray-400">
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gold-300/15 text-xs font-bold text-gold-300">1</span>
                  Our team validates your InstaPay payment on WhatsApp.
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gold-300/15 text-xs font-bold text-gold-300">2</span>
                  We connect you with your tutor and confirm the session.
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gold-300/15 text-xs font-bold text-gold-300">3</span>
                  After the session, the tutor receives their payout.
                </li>
              </ol>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${WHATSAPP_SUPPORT}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3.5 text-sm font-semibold text-emerald-300 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/15"
            >
              <MessageCircle className="h-5 w-5" />
              Contact Support on WhatsApp
            </a>

            <button
              onClick={() => navigate('/')}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-ink-border bg-ink-raised px-4 py-3 text-sm font-medium text-gray-400 transition-all hover:border-gold-600/40 hover:text-gold-200"
            >
              <Home className="h-4 w-4" />
              Back to Directory
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-600">
          Save your Booking ID <span className="font-mono text-gold-600">#{booking.booking_code}</span> for reference.
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-gray-500">
        <Icon className="h-4 w-4 text-gold-400" />
        {label}
      </span>
      <span className="text-sm font-medium text-gray-200">{value}</span>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
