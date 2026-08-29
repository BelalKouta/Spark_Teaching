import { BookOpen, Shield, GraduationCap } from 'lucide-react';
import { navigate, useScrollSpy } from '@/lib/router';

export function Navbar() {
  const scrolled = useScrollSpy();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ink-base/90 backdrop-blur-xl border-b border-ink-border'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 shadow-gold-glow">
            <BookOpen className="h-5 w-5 text-ink-base" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            <span className="gold-text">PeerTutor</span>
            <span className="text-gray-400"> EGP</span>
          </span>
        </button>

        <nav className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-gold-200 sm:px-4"
          >
            Find Tutors
          </button>
          <button
            onClick={() => navigate('/assistant/login')}
            className="flex items-center gap-1.5 rounded-lg border border-ink-border bg-ink-card px-3 py-2 text-sm font-medium text-gray-300 transition-all hover:border-gold-600/50 hover:text-gold-200 sm:px-4"
          >
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Teacher Portal</span>
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1.5 rounded-lg border border-ink-border bg-ink-card px-3 py-2 text-sm font-medium text-gray-300 transition-all hover:border-gold-600/50 hover:text-gold-200 sm:px-4"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
