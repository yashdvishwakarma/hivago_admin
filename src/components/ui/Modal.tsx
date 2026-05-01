import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div
        className={cn(
          'relative z-50 w-full max-w-lg transform overflow-hidden rounded-xl bg-background p-6 text-left align-middle shadow-xl transition-all sm:my-8',
          className
        )}
      >
        <div className="flex items-center justify-between mb-5">
          {title && <h3 className="text-lg font-semibold leading-6 text-foreground">{title}</h3>}
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
