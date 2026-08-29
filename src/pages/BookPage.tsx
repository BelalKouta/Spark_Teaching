import { useEffect, useState, useMemo } from 'react';
import { useRoute, navigate } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import type { Assistant, Slot } from '@/types';
import {
  Calendar, Clock, Check, ChevronLeft, User, Mail, Phone, Upload,
  CreditCard, MessageCircle, ArrowRight, AlertCircle, QrCode, ClipboardList,
} from 'lucide-react';
import { RatingBadge } from '@/components/Badges';

const COUNTRY_CODES = [
  { code: '+20', label: '🇪🇬 Egypt (+20)' },
  { code: '+966', label: '🇸🇦 KSA (+966)' },
  { code: '+971', label: '🇦🇪 UAE (+971)' },
  { code: '+1', label: '🇺🇸 USA (+1)' },
  { code: '+44', label: '🇬🇧 UK (+44)' },
];

const INSTAPAY_HANDLE = 'PeerTutor@instapay';
const INSTAPAY_PHONE = '+20 100 123 4567';
const WHATSAPP_SUPPORT = '201001234567';

type Step = 'details' | 'payment';

export function BookPage() {
  const route = useRoute();
  const assistantId =
    route.name === 'book' ? route.assistantId : '';

  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('details');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [duration, setDuration] = useState(1);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+20');
  const [phone, setPhone] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('assistants')
        .select('*')
        .eq('id', assistantId)
        .maybeSingle();
      if (!error && data) setAssistant(data as Assistant);
      setLoading(false);
    })();
  }, [assistantId]);

  const totalCost = useMemo(() => {
    if (!assistant) return 0;
    return assistant.hourly_rate * duration;
  }, [assistant, duration]);

  const slotsByDate = useMemo(() => {
    if (!assistant?.available_slots) return {};
    const map: Record<string, Slot[]> = {};
    for (const slot of assistant.available_slots as Slot[]) {
      if (!map[slot.date]) map[slot.date] = [];
      map[slot.date].push(slot);
    }
    return map;
  }, [assistant]);

  const sortedDates = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate]);

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setError('Receipt image must be under 3MB.');
      return;
    }
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = () => setReceiptPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validateDetails = () => {
    if (!selectedSlot) {
      setError('Please select a date and time slot.');
      return false;
    }
    if (!studentName.trim()) {
      setError('Please enter your name.');
      return false;
    }
    if (!studentEmail.trim() || !studentEmail.includes('@')) {
      setError('Please enter a valid university email or ID.');
      return false;
    }
    if (!phone.trim() || phone.length < 6) {
      setError('Please enter a valid WhatsApp number.');
      return false;
    }
    if (!lessonDescription.trim() || lessonDescription.trim().length < 10) {
      setError('Please describe what topics you need help with (at least a sentence).');
      return false;
    }
    setError(null);
    return true;
  };

  const validatePayment = () => {
    if (!paymentRef.trim() || paymentRef.trim().length < 4) {
      setError('Please enter your InstaPay transaction reference number.');
      return false;
    }
    if (!receiptFile) {
      setError('Please upload a screenshot of your payment receipt.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validatePayment() || !assistant || !selectedSlot) return;
    setSubmitting(true);
    setError(null);

    const code = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullPhone = `${countryCode} ${phone}`;

    const { data, error: insertError } = await supabase
      .from('bookings')
      .insert({
        booking_code: code,
        assistant_id: assistant.id,
        student_name: studentName.trim(),
        student_email: studentEmail.trim(),
        student_phone: fullPhone,
        session_date: selectedSlot.date,
        session_time: selectedSlot.time,
        duration_hours: duration,
        total_cost: totalCost,
        payment_ref: paymentRef.trim(),
        receipt_url: receiptPreview,
        lesson_description: lessonDescription.trim(),
        status: 'pending_verification',
      })
      .select()
      .maybeSingle();

    setSubmitting(false);

    if (insertError || !data) {
      setError('Could not submit your booking. Please try again.');
      return;
    }

    navigate(`/confirmation/${code}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-border border-t-gold-300" />
      </div>
    );
  }

  if (!assistant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center pt-20 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-gray-600" />
        <p className="text-lg font-medium text-gray-400">Tutor not found</p>
        <button onClick={() => navigate('/')} className="btn-gold mt-4">
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-gold-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to tutors
        </button>

        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-3">
          <StepIndicator
            num={1}
            label="Session Details"
            active={step === 'details'}
            done={step === 'payment'}
          />
          <div className="h-px flex-1 bg-ink-border" />
          <StepIndicator
            num={2}
            label="InstaPay Payment"
            active={step === 'payment'}
            done={false}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="card-base overflow-hidden">
              <div className="relative h-32">
                <img
                  src={assistant.photo_url}
                  alt={assistant.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-card to-transparent" />
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg font-bold text-gold-100">
                  {assistant.name}
                </h3>
                <p className="text-xs text-gray-500">{assistant.university}</p>
                <div className="mt-2 flex items-center gap-3">
                  <RatingBadge rating={assistant.rating} />
                  <span className="text-xs text-gray-500">{assistant.major}</span>
                </div>

                <div className="mt-4 space-y-2 border-t border-ink-border pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rate</span>
                    <span className="text-gray-300">{assistant.hourly_rate} EGP/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="text-gray-300">{duration} hr{duration > 1 ? 's' : ''}</span>
                  </div>
                  {selectedSlot && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Session</span>
                      <span className="text-gray-300 text-right text-xs">
                        {formatDate(selectedSlot.date)}
                        <br />
                        {selectedSlot.time}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-amber-600/20 pt-4">
                  <span className="text-sm font-medium text-gray-400">Total</span>
                  <span className="font-display text-2xl font-bold gold-text">
                    {totalCost} EGP
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div>
            {step === 'details' && (
              <div className="space-y-6 animate-fade-in">
                {/* Date & Time */}
                <div className="card-base p-5 sm:p-6">
                  <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-gold-100">
                    <Calendar className="h-5 w-5 text-gold-300" />
                    Select Date & Time
                  </h3>
                  <p className="mb-4 text-sm text-gray-500">
                    Choose from available slots below.
                  </p>

                  <div className="space-y-4">
                    {sortedDates.map((date) => (
                      <div key={date}>
                        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {formatDate(date)}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {slotsByDate[date].map((slot) => {
                            const isSelected =
                              selectedSlot?.date === slot.date &&
                              selectedSlot?.time === slot.time;
                            return (
                              <button
                                key={`${slot.date}-${slot.time}`}
                                onClick={() => setSelectedSlot(slot)}
                                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all ${
                                  isSelected
                                    ? 'border-gold-400 bg-gold-300/15 text-gold-100 shadow-gold-glow'
                                    : 'border-ink-border bg-ink-raised text-gray-400 hover:border-gold-600/40 hover:text-gold-200'
                                }`}
                              >
                                <Clock className="h-3.5 w-3.5" />
                                {slot.time}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Duration */}
                  <div className="mt-5 border-t border-ink-border pt-4">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Session Duration
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((h) => (
                        <button
                          key={h}
                          onClick={() => setDuration(h)}
                          className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                            duration === h
                              ? 'border-gold-400 bg-gold-300/15 text-gold-100'
                              : 'border-ink-border bg-ink-raised text-gray-400 hover:border-gold-600/40 hover:text-gold-200'
                          }`}
                        >
                          {h} hr{h > 1 ? 's' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="card-base p-5 sm:p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-gold-100">
                    <User className="h-5 w-5 text-gold-300" />
                    Your Contact Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-400">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                        <input
                          type="text"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="e.g. Ahmed Sherif"
                          className="input-dark pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-400">
                        University Email or Student ID
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                        <input
                          type="text"
                          value={studentEmail}
                          onChange={(e) => setStudentEmail(e.target.value)}
                          placeholder="e.g. name@university.edu.eg"
                          className="input-dark pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-400">
                        WhatsApp Phone Number
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-36 flex-shrink-0 rounded-xl border border-ink-border bg-ink-raised px-3 py-3 text-sm text-gray-200 focus:border-gold-600/60 focus:outline-none"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <div className="relative flex-1">
                          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. 100 123 4567"
                            className="input-dark pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lesson Description */}
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-400">
                      What topics or specific lessons do you need help with?
                    </label>
                    <div className="relative">
                      <ClipboardList className="absolute left-3 top-3.5 h-4 w-4 text-gray-600" />
                      <textarea
                        value={lessonDescription}
                        onChange={(e) => setLessonDescription(e.target.value)}
                        rows={4}
                        placeholder="e.g. I need help with linked lists, binary trees, and Big-O analysis for my upcoming midterm..."
                        className="input-dark pl-10 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  onClick={() => {
                    if (validateDetails()) setStep('payment');
                  }}
                  className="btn-gold w-full"
                >
                  Continue to Payment
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-6 animate-fade-in">
                {/* InstaPay Payment */}
                <div className="card-base p-5 sm:p-6">
                  <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-gold-100">
                    <CreditCard className="h-5 w-5 text-gold-300" />
                    InstaPay Payment
                  </h3>
                  <p className="mb-5 text-sm text-gray-500">
                    Send {totalCost} EGP via InstaPay to the handle below, then
                    enter your transaction reference and upload a screenshot of
                    the receipt.
                  </p>

                  {/* QR + Handle */}
                  <div className="flex flex-col items-center gap-4 rounded-xl border border-amber-600/30 bg-ink-raised p-5 sm:flex-row sm:items-start">
                    <div className="flex flex-shrink-0 flex-col items-center gap-2">
                      <div className="flex h-32 w-32 items-center justify-center rounded-xl border-2 border-amber-600/40 bg-ink-base p-2">
                        <QrCode className="h-24 w-24 text-gold-300" strokeWidth={1} />
                      </div>
                      <span className="text-xs text-gray-500">Scan to pay</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="text-xs text-gray-500">InstaPay Handle</div>
                        <div className="mt-0.5 font-mono text-sm font-semibold text-gold-200">
                          {INSTAPAY_HANDLE}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Phone Number</div>
                        <div className="mt-0.5 font-mono text-sm font-semibold text-gold-200">
                          {INSTAPAY_PHONE}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Amount Due</div>
                        <div className="mt-0.5 font-display text-xl font-bold gold-text">
                          {totalCost} EGP
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp support */}
                  <a
                    href={`https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent(
                      'Hi, I need help with my InstaPay payment for a tutor booking.'
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/15"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Need help? Chat with Support on WhatsApp
                  </a>
                </div>

                {/* Payment Details */}
                <div className="card-base p-5 sm:p-6">
                  <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-gold-100">
                    <Check className="h-5 w-5 text-gold-300" />
                    Confirm Your Payment
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-400">
                        InstaPay Transaction Reference Number
                      </label>
                      <input
                        type="text"
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                        placeholder="e.g. IP-92837465"
                        className="input-dark font-mono"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-400">
                        Upload Payment Receipt Screenshot
                      </label>
                      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-border bg-ink-raised px-4 py-8 text-center transition-colors hover:border-gold-600/40">
                        {receiptPreview ? (
                          <div className="space-y-2">
                            <img
                              src={receiptPreview}
                              alt="Receipt preview"
                              className="mx-auto max-h-40 rounded-lg border border-ink-border"
                            />
                            <span className="text-xs text-gold-200">
                              Click to change image
                            </span>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-gray-600" />
                            <span className="text-sm text-gray-400">
                              Click to upload screenshot
                            </span>
                            <span className="text-xs text-gray-600">
                              PNG, JPG up to 3MB
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/png,image/jpeg"
                          className="hidden"
                          onChange={(e) =>
                            handleFileChange(e.target.files?.[0] ?? null)
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => setStep('details')}
                    className="btn-ghost flex-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn-gold flex-1"
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-base/30 border-t-ink-base" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Booking Request
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({
  num,
  label,
  active,
  done,
}: {
  num: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all ${
          done
            ? 'border-gold-400 bg-gold-300 text-ink-base'
            : active
            ? 'border-gold-400 bg-gold-300/15 text-gold-200 shadow-gold-glow'
            : 'border-ink-border bg-ink-card text-gray-600'
        }`}
      >
        {done ? <Check className="h-4 w-4" /> : num}
      </div>
      <span
        className={`text-sm font-medium ${
          active || done ? 'text-gold-100' : 'text-gray-600'
        }`}
      >
        {label}
      </span>
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
