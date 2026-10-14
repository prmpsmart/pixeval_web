import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Btn, Card, Body, Check, Empty, Field, Icon, PageHead, Pill, Select, Seg } from '../components/ui'
import { ContextBar } from '../components/ContextBar'
import { PathField } from '../components/PathField'
import { SheetView } from '../components/SheetView'
import { useSubjectData } from '../lib/hooks'
import { useApp } from '../store/useApp'

type Mode = 'bulk' | 'manual'

export function Assign() {
  const nav = useNavigate()
  const { assignOne, assignAll, open } = useApp()
  const { participants } = useSubjectData()
  const [mode, setMode] = useState<Mode>('manual')
  const [sheetSn, setSheetSn] = useState<number>()
  const [whoSn, setWhoSn] = useState<number>()
  const [header, setHeader] = useState(true)

  const head = (
    <PageHead title="Assign identities" sub="Match each scanned anonymous sheet back to a participant." />
  )
  if (!participants.length) {
    return (
      <>
        {head}
        <Empty icon="users">
          No sheets yet.{' '}
          <a
            style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => open('participant', 'new')}
          >
            Add a participant
          </a>
        </Empty>
      </>
    )
  }
  const open_ = participants.filter((p) => !p.assigned)
  const cur = participants.find((p) => p.sn === sheetSn) ?? open_[0] ?? participants[0]
  const who = participants.find((p) => p.sn === (whoSn ?? cur.sn)) ?? cur
  const assigned = participants.length - open_.length

  const assign = () => {
    assignOne(cur.sn, who.sn)
    const next = useApp.getState().participants.find((p) => p.subject === cur.subject && !p.assigned)
    setSheetSn(next?.sn)
    setWhoSn(undefined)
  }

  return (
    <>
      {head}
      <Seg
        tabs={[
          ['bulk', 'Bulk assignments'],
          ['manual', 'Manual assignment'],
        ]}
        value={mode}
        onChange={setMode}
      />
      <div style={{ height: 18 }} />
      <ContextBar />
      {mode === 'manual' ? (
        <div className="grid" style={{ gridTemplateColumns: '300px 1fr 1fr', alignItems: 'start' }}>
          <Card flush title="Scanned sheets" sub={`${open_.length} unassigned`}>
            <div style={{ maxHeight: 520, overflow: 'auto' }}>
              {participants.slice(0, 60).map((p) => (
                <div
                  key={p.sn}
                  onClick={() => {
                    setSheetSn(p.sn)
                    setWhoSn(undefined)
                  }}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                    padding: '9px 16px',
                    borderTop: '1px solid var(--line-2)',
                    cursor: 'pointer',
                    background: p.sn === cur.sn ? 'var(--brand-soft)' : undefined,
                  }}
                >
                  <span className="mono" style={{ fontSize: 12.5 }}>
                    {p.id}
                  </span>
                  <span style={{ marginLeft: 'auto' }}>
                    <Pill tone={p.assigned ? 'c-ok' : 'c-warn'}>{p.assigned ? 'Assigned' : 'Open'}</Pill>
                  </span>
                </div>
              ))}
            </div>
          </Card>
          <Card
            title="Participant identity"
            right={
              <Btn variant="sm" icon="search" onClick={() => open('search-participants')}>
                Search
              </Btn>
            }
          >
            <Body>
              <Field label="Participant">
                <Select
                  value={String(who.sn)}
                  onChange={(v) => setWhoSn(Number(v))}
                  options={participants.map((p) => [String(p.sn), `${p.surnames}, ${p.name} — ${p.dni}`])}
                />
              </Field>
              <div className="row">
                <Field label="Barcode">
                  <div className="in mono">{who.barcode}</div>
                </Field>
                <Field label="DNI / ID">
                  <div className="in mono">{who.dni}</div>
                </Field>
              </div>
              <div className="row">
                <Field label="Name">
                  <div className="in">{who.name}</div>
                </Field>
                <Field label="Surnames">
                  <div className="in">{who.surnames}</div>
                </Field>
              </div>
              <div className="row">
                <Field label="Email">
                  <div className="in">{who.email}</div>
                </Field>
                <Field label="Phone">
                  <div className="in">{who.phone}</div>
                </Field>
              </div>
              <hr className="s" />
              <Btn variant="p lg" icon="uid" onClick={assign}>
                Assign identity
              </Btn>
            </Body>
          </Card>
          <Card title="Sheet" sub={cur.id}>
            <Body>
              <SheetView p={cur} rows={16} />
            </Body>
          </Card>
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
          <Card title="Bulk assignments" sub="Match sheets to participants from a file.">
            <Body>
              <Field label="Assignment file (XLSX / CSV)">
                <PathField id="assignFile" placeholder="Select assignment file" mode="file" />
              </Field>
              <div className="row">
                <Field label="Sheet column">
                  <Select
                    value="A"
                    onChange={() => undefined}
                    options={[
                      ['A', 'A – Sheet ID'],
                      ['B', 'B – Barcode'],
                    ]}
                  />
                </Field>
                <Field label="Participant column">
                  <Select
                    value="C"
                    onChange={() => undefined}
                    options={[
                      ['C', 'C – DNI'],
                      ['D', 'D – Reference'],
                    ]}
                  />
                </Field>
              </div>
              <div style={{ margin: '4px 0 14px' }}>
                <Check on={header} onChange={setHeader}>
                  First row is a header
                </Check>
              </div>
              <hr className="s" />
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="p lg" icon="uid" onClick={assignAll}>
                  Assign all
                </Btn>
                <Btn icon="list" onClick={assignAll}>
                  Use roster order
                </Btn>
              </div>
            </Body>
          </Card>
          <Card title="Progress">
            <Body>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-.03em' }}>{assigned}</span>
                <span style={{ color: 'var(--muted)' }}>{`of ${participants.length} sheets assigned`}</span>
              </div>
              <div className="bar" style={{ margin: '10px 0 14px', height: 8 }}>
                <i style={{ width: `${(assigned / participants.length) * 100}%` }} />
              </div>
              {open_.length ? (
                <div className="hint">{`${open_.length} sheets still show anonymous names in Grades.`}</div>
              ) : (
                <>
                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      color: 'var(--ok)',
                      fontWeight: 600,
                    }}
                  >
                    <Icon name="check" />
                    All sheets assigned
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <Btn variant="p" right="right" onClick={() => nav('/grades')}>
                      View grades
                    </Btn>
                  </div>
                </>
              )}
            </Body>
          </Card>
        </div>
      )}
    </>
  )
}
