'use client';

import { useState } from 'react';

export function CopyButton({ text, label = 'Copiar' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded border border-linha px-3 py-1.5 text-sm font-medium text-tinta transition-colors hover:border-tinta"
    >
      <span aria-live="polite">{copied ? 'Copiado' : label}</span>
    </button>
  );
}
