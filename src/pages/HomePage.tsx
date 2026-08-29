import { useEffect, useState, useMemo } from 'react';
import { Search, Play, GraduationCap, Clock, Filter, X, Sparkles, ArrowRight, BookOpen, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { navigate } from '@/lib/router';
import type { Assistant } from '@/types';
import { Modal } from '@/components/Modal';
import { RatingBadge } from '@/components/Badges';

const SUBJECT_TAGS = [
  'All Subjects', 'Computer Science', 'Engineering', 'Business', 'Pharmacy',
  'Data Structures', 'Physics I', 'Microeconomics', 'Organic Chemistry',
  'Python', 'Thermodynamics', 'Statistics', 'Biochemistry',
];

const PRICE_RANGES = [
  { label: 'Any Price', min: 0, max: 9999 },
  { label: 'Under 180 EGP', min: 0, max: 179 },
  { label: '180–200 EGP', min: 180, max: 200 },
  { label: '200+ EGP', min: 201, max: 9999 },
];

export function HomePage() {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSubject, setActiveSubject] = useState('All Subjects');
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [videoAssistant, setVideoAssistant] = useState<Assistant | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('assistants').select('*');
      if (!error && data) setAssistants(data as Assistant[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    return assistants.filter((a) => {
      const matchesSearch =
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.major.toLowerCase().includes(search.toLowerCase()) ||
        a.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase()));
      const matchesSubject =
        activeSubject === 'All Subjects' ||
        a.subjects.includes(activeSubject) ||
        a.major === activeSubject;
      const matchesPrice =
        a.hourly_rate >= priceRange.min && a.hourly_rate <= priceRange.max;
      return matchesSearch && matchesSubject && matchesPrice;
    });
  }, [assistants, search, activeSubject, priceRange]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-ink-card/50 via-ink-base to-ink-base" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(212,175,55,0.12) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(212,175,55,0.08) 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-600/30 bg-ink-card/60 px-4 py-1.5 text-xs font-medium text-gold-200 backdrop-blur-sm animate-slide-up">
              <Sparkles className="h-3.5 w-3.5" />
              Egypt's #1 peer tutoring marketplace
            </div>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-balance animate-slide-up sm:text-6xl">
              Find your perfect <span className="gold-text">peer tutor</span>.
              <br className="hidden sm:block" /> Book in minutes, pay with{' '}
              <span className="gold-text">InstaPay</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-gray-400 text-balance animate-slide-up sm:text-lg">
              Browse intro videos from top university students, pick a time that
              works, and pay securely via InstaPay. Simple, fast, and built for
              Egyptian students.
            </p>

            {/* Search Bar */}
            <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl border border-ink-border bg-ink-card/80 p-2 backdrop-blur-md animate-slide-up">
              <Search className="ml-2 h-5 w-5 flex-shrink-0 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, subject, or major..."
                className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-500 focus:outline-none"
              />
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                  showFilters
                    ? 'bg-gold-300/15 text-gold-200 border border-gold-600/40'
                    : 'border border-ink-border bg-ink-raised text-gray-400 hover:text-gold-200'
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
              </button>
            </div>

            {/* Filter Tags */}
            {showFilters && (
              <div className="mx-auto mt-4 max-w-3xl animate-fade-in space-y-3">
                <div className="flex flex-wrap justify-center gap-2">
                  {SUBJECT_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setActiveSubject(tag)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                        activeSubject === tag
                          ? 'bg-gradient-to-r from-gold-300 to-gold-400 text-ink-base shadow-gold-glow'
                          : 'border border-ink-border bg-ink-card text-gray-400 hover:border-gold-600/40 hover:text-gold-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {PRICE_RANGES.map((pr) => (
                    <button
                      key={pr.label}
                      onClick={() => setPriceRange(pr)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                        priceRange.label === pr.label
                          ? 'bg-gradient-to-r from-gold-300 to-gold-400 text-ink-base shadow-gold-glow'
                          : 'border border-ink-border bg-ink-card text-gray-400 hover:border-gold-600/40 hover:text-gold-200'
                      }`}
                    >
                      {pr.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: GraduationCap, label: 'Verified Tutors', value: '120+' },
            { icon: BookOpen, label: 'Subjects Covered', value: '45' },
            { icon: Clock, label: 'Avg. Response', value: '2 hrs' },
            { icon: TrendingUp, label: 'Sessions Booked', value: '3,400+' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card-base flex items-center gap-3 p-4 transition-colors hover:border-gold-600/30"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gold-300/10">
                <stat.icon className="h-5 w-5 text-gold-300" />
              </div>
              <div>
                <div className="text-lg font-bold text-gold-200">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Assistant Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Available Tutors
            <span className="ml-3 text-sm font-normal text-gray-500">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="card-base h-96 animate-pulse overflow-hidden"
              >
                <div className="h-40 bg-ink-raised" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-2/3 rounded bg-ink-raised" />
                  <div className="h-3 w-1/2 rounded bg-ink-raised" />
                  <div className="h-3 w-3/4 rounded bg-ink-raised" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-base flex flex-col items-center justify-center py-20 text-center">
            <Search className="mb-4 h-12 w-12 text-gray-600" />
            <p className="text-lg font-medium text-gray-400">No tutors found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setActiveSubject('All Subjects');
                setPriceRange(PRICE_RANGES[0]);
              }}
              className="btn-ghost mt-4"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a, i) => (
              <AssistantCard
                key={a.id}
                assistant={a}
                index={i}
                onWatchVideo={() => setVideoAssistant(a)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Video Modal */}
      <Modal
        open={!!videoAssistant}
        onClose={() => setVideoAssistant(null)}
        className="max-w-2xl"
      >
        {videoAssistant && (
          <div className="p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <img
                src={videoAssistant.photo_url}
                alt={videoAssistant.name}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-gold-600/40"
              />
              <div>
                <h3 className="font-display text-lg font-bold text-gold-100">
                  {videoAssistant.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {videoAssistant.major} · {videoAssistant.university}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-amber-600/30 bg-ink-base">
              <video
                src={videoAssistant.video_url}
                controls
                autoPlay
                className="h-auto w-full"
                poster={videoAssistant.photo_url}
              />
            </div>

            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              {videoAssistant.bio}
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  navigate(`/book/${videoAssistant.id}`);
                  setVideoAssistant(null);
                }}
                className="btn-gold flex-1"
              >
                Proceed to Booking
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setVideoAssistant(null)}
                className="btn-ghost flex-1 sm:flex-none"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function AssistantCard({
  assistant,
  index,
  onWatchVideo,
}: {
  assistant: Assistant;
  index: number;
  onWatchVideo: () => void;
}) {
  return (
    <div
      className="card-base group flex flex-col overflow-hidden transition-all duration-300 hover:border-gold-600/40 hover:shadow-gold-glow animate-slide-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Photo */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={assistant.photo_url}
          alt={assistant.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-card via-ink-card/20 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-white drop-shadow-lg">
              {assistant.name}
            </h3>
            <p className="text-xs text-gold-200/90">{assistant.university}</p>
          </div>
          <RatingBadge rating={assistant.rating} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
          <GraduationCap className="h-3.5 w-3.5 text-gold-400" />
          {assistant.major}
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {assistant.subjects.slice(0, 4).map((s) => (
            <span
              key={s}
              className="rounded-lg border border-ink-border bg-ink-raised px-2.5 py-1 text-xs text-gray-400"
            >
              {s}
            </span>
          ))}
        </div>

        <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-gray-500">
          {assistant.bio}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="font-display text-xl font-bold text-gold-200">
              {assistant.hourly_rate}
            </span>
            <span className="text-sm text-gray-500"> EGP/hr</span>
          </div>
          <button
            onClick={onWatchVideo}
            className="flex items-center gap-2 rounded-xl border border-amber-600/30 bg-ink-raised px-4 py-2.5 text-xs font-semibold text-gold-200 transition-all hover:border-gold-600/60 hover:bg-gold-300/10 hover:shadow-gold-glow"
          >
            <Play className="h-3.5 w-3.5 fill-gold-300 text-gold-300" />
            Watch Intro
          </button>
        </div>
      </div>
    </div>
  );
}
