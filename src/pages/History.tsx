import { useState } from 'react'
import { Btn, Card, Body, Check, Drop, Field, PageHead, Select, TextArea } from '../components/ui'
import { ExamSelect, SubjectSelect } from '../components/ContextBar'
import { PathField } from '../components/PathField'
import { useSubjectData } from '../lib/hooks'
import { useApp } from '../store/useApp'

const SECTIONS = [
  { title: 'Section A — Constitutional law', range: 'Q1–50' },
  { title: 'Section B — Administrative law', range: 'Q51–100' },
]
const opt = (xs: string[]): [string, string][] => xs.map((x) => [x, x])

export function History() {
  const { open, toast, log } = useApp()
  const { exam } = useSubjectData()
  const [instr, setInstr] = useState('')
  const [sections, setSections] = useState(false)
  const [hdr, setHdr] = useState('Standard'),
    [fmt, setFmt] = useState('PDF'),
    [exp, setExp] = useState('gift')
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const flag = (k: string, label: string) => (
    <Check on={!!flags[k]} onChange={(v) => setFlags({ ...flags, [k]: v })}>
      {label}
    </Check>
  )
  return (
    <>
      <PageHead
        title="History"
        sub="Print, preview and export this exam in any model."
        actions={
          <>
            <Btn icon="edit" onClick={() => exam && open('edit-exam', String(exam.id))}>
              Edit exam
            </Btn>
            <Btn
              variant="p"
              icon="print"
              onClick={() => {
                log('Print exam')
                toast('Exam saved to print', 'examen_model1.pdf')
              }}
            >
              Save to print
            </Btn>
          </>
        }
      />
      <div className="row" style={{ marginBottom: 16 }}>
        <SubjectSelect />
        <ExamSelect />
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', alignItems: 'start' }}>
        <div className="grid">
          <Card title="Exam instructions" right={<span className="pill c-blue np">RTE</span>}>
            <Body>
              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>
                <Drop title="Drop your header image here" />
                <TextArea rows={7} value={instr} onChange={setInstr} placeholder="Enter exam instructions" />
              </div>
            </Body>
          </Card>
          <Card title="Output folder">
            <Body>
              <PathField id="historyOut" placeholder="Enter output folder" />
            </Body>
          </Card>
          <Card
            title="Sections"
            right={
              <Check on={sections} onChange={setSections}>
                Enable
              </Check>
            }
          >
            <Body>
              {sections ? (
                <div className="grid" style={{ gap: 8 }}>
                  {SECTIONS.map((s, i) => (
                    <div
                      key={s.title}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        border: '1px solid var(--line)',
                        borderRadius: 10,
                        padding: '10px 14px',
                      }}
                    >
                      <b style={{ flex: 1 }}>{s.title}</b>
                      <span className="hint" style={{ margin: 0 }}>
                        {s.range}
                      </span>
                      <Btn variant="sm" icon="edit" onClick={() => open('section', String(i))}>
                        Modify
                      </Btn>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="hint" style={{ margin: 0 }}>
                  Group questions into sections inside the printed exam.
                </div>
              )}
            </Body>
          </Card>
        </div>
        <div className="grid">
          <Card title="Printing">
            <Body>
              <div className="row" style={{ marginBottom: 14 }}>
                <Select label="Model" value="1" onChange={() => undefined} options={opt(['1'])} />
                <Select label="Lang" value="1" onChange={() => undefined} options={opt(['1', 'es', 'en'])} />
              </div>
              <Field label="Header type">
                <Select value={hdr} onChange={setHdr} options={opt(['Standard', 'Compact', 'None'])} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '14px 0' }}>
                {flag('h', 'Highlight questions')}
                {flag('d', 'Double column')}
                {flag('s', 'Separate instructions')}
                {flag('l', 'Large letter size')}
                {flag('e', 'Extra separation')}
              </div>
              <hr className="s" />
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn icon="eye" onClick={() => open('preview-exam')}>
                  Preview exam
                </Btn>
                <div style={{ width: 130 }}>
                  <Select
                    label="Format"
                    value={fmt}
                    onChange={setFmt}
                    options={opt(['PDF', 'DOCX', 'HTML'])}
                  />
                </div>
              </div>
            </Body>
          </Card>
          <Card title="Other options">
            <Body>
              <Btn
                icon="eye"
                style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}
                onClick={() => open('matrix')}
              >
                Correction matrix
              </Btn>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Select
                    label="Export other formats"
                    value={exp}
                    onChange={setExp}
                    options={opt(['gift', 'moodle xml', 'csv', 'aiken'])}
                  />
                </div>
                <Btn icon="up" onClick={() => toast('Exam exported', `examen.${exp.split(' ')[0]}`)}>
                  Export
                </Btn>
              </div>
            </Body>
          </Card>
        </div>
      </div>
    </>
  )
}
