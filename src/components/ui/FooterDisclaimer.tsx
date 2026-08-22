'use client';

export function FooterDisclaimer({ className = '' }: { className?: string }) {
  return (
    <footer className={`w-full py-3 px-4 text-center select-none ${className}`}>
      <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium tracking-normal">
        Property X AI can make mistakes. Check important info.
      </p>
    </footer>
  );
}
