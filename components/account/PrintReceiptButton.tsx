'use client'

/**
 * Triggers the browser print dialog. The receipt is styled for print via the
 * `print:` utilities on the page, so "Save as PDF" produces a clean invoice
 * without needing a PDF library on the server.
 */
export default function PrintReceiptButton({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`btn-outline-gold text-xs print:hidden ${className}`}
    >
      Print / save PDF
    </button>
  )
}
