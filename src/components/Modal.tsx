import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, children, className = '' }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-ink-base/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full max-w-lg animate-scale-in rounded-2xl border border-amber-600/30 bg-ink-card shadow-gold-glow-lg ${className}`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-ink-border bg-ink-raised text-gray-400 transition-all hover:border-gold-600/50 hover:text-gold-200"
        >
          <X className="h-4.5 w-4.5" />
        </button>
        {children}
      </div>
    </div>
  );
}
