import { answerOf, questionsOf } from '../lib/domain'
import type { Participant } from '../data/types'
import { useApp } from '../store/useApp'

const LETTERS = ['a', 'b', 'c'] as const

/** A miniature OMR answer sheet showing the bubbles a participant filled. */
export function SheetView({ p, rows = 14 }: { p: Participant; rows?: number }) {
  const data = useApp()
  const qs = questionsOf(data, p.subject).slice(0, rows)
  return (
    <div className="sheetprev">
      <div style={{ fontWeight: 700, fontSize: 12.5 }}>TJ – Técnico Jurídico</div>
      <div style={{ fontSize: 10.5, color: '#8A94A8', marginBottom: 8 }}>
        Examen TJ (02/01/2026) · ID {p.id}
      </div>
      <div style={{ display: 'flex', gap: 2, margin: '8px 0' }}>
        {p.id.split('').map((d, i) => (
          <div
            key={i}
            style={{ flex: 1, textAlign: 'center', font: '600 9px var(--mono)', color: '#8A94A8' }}
          >
            {d}
          </div>
        ))}
      </div>
      <div style={{ columns: 2, columnGap: 18 }}>
        {qs.map((q, i) => (
          <div className="bub" key={q.id}>
            <b>{String(i + 1).padStart(2, '0')}</b>
            {LETTERS.map((o) => (
              <i key={o} className={answerOf(p, q) === o ? 'f' : ''} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
