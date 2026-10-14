import { useState } from 'react'
import { Btn, Card, Body, Check, Drop, Field, Input, PageHead, Select, Stepper, Tabs } from '../components/ui'
import { ContextBar } from '../components/ContextBar'
import { PathField } from '../components/PathField'
import { SheetView } from '../components/SheetView'
import { useSubjectData } from '../lib/hooks'
import { useApp } from '../store/useApp'

type Tab = 'sheet' | 'anon' | 'tpl' | 'interp'
const TABS = [
  { id: 'sheet' as const, label: 'Answer sheet', icon: 'print' as const }, { id: 'anon' as const, label: 'Anonymous sheets', icon: 'lock' as const },
  { id: 'tpl' as const, label: 'Sheets from template', icon: 'file' as const }, { id: 'interp' as const, label: 'Interpret answer sheet', icon: 'scan' as const },
]
const opt = (xs: string[]): [string, string][] => xs.map((x) => [x, x])

export function Sheets() {
  const [tab, setTab] = useState<Tab>('sheet')
  const { open, toast, log, group } = useApp()
  const { questions, participants } = useSubjectData()
  const [interpreted, setInterpreted] = useState(false)
  const [q, setQ] = useState(questions.length || 100), [a, setA] = useState(3)
  const [n, setN] = useState(participants.length || 128)
  const [code, setCode] = useState(true), [pname, setPname] = useState(false)
  const [lang, setLang] = useState('es Español'), [type, setType] = useState('Identifier | 1'), [fmt, setFmt] = useState('Exam format')
  const sample = participants[3] ?? participants[0]

  const generate = () => { log('Generate answer sheets'); toast('Answer sheets generated', `sheets_${useApp.getState().subject}.pdf · ${participants.length} sheets`) }

  const main = {
    sheet: (<>
      <Card title="Header details"><Body><div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 18 }}>
        <Drop title="Drop header image" hint="PNG or JPG" />
        <div><Field label="Line 1"><Input value="TJ – Técnico Jurídico" onChange={() => undefined} /></Field><Field label="Line 2"><Input value="Examen TJ (02/01/2026)" onChange={() => undefined} /></Field></div>
      </div></Body></Card>
      <Card title="Additional sheet instructions"><Body><Drop title="Drop your additional instructions image here" hint="or browse files" /></Body></Card>
      <Card title="Output"><Body><label className="f">Select output file</label><PathField id="sheetsOut" placeholder="Enter output file" mode="file" /></Body></Card>
    </>),
    anon: (<>
      <Card title="Anonymous sheets" sub="Blank sheets with unique barcodes — identities are assigned after scanning."><Body>
        <div className="row">
          <div><label className="f">How many sheets</label><Stepper value={n} min={1} max={1000} step={8} onChange={setN} /></div>
          <Field label="Start number"><Input mono value="24053001" onChange={() => undefined} /></Field><Field label="Prefix"><Input value="TJ-" onChange={() => undefined} /></Field>
        </div>
        <hr className="s" /><div style={{ display: 'flex', gap: 18 }}><Check on onChange={() => undefined}>One page per sheet</Check><Check on onChange={() => undefined}>Include header</Check></div>
      </Body></Card>
      <Card title="Output"><Body><PathField id="sheetsOut" placeholder="Enter output file" mode="file" /></Body></Card>
    </>),
    tpl: (<>
      <Card title="Sheets from template" sub="Fill a template with participant data."><Body>
        <Field label="Template (.docx / .pdf)"><PathField id="template" placeholder="Select template" mode="file" /></Field>
        <Field label="Participants"><Select value="all" onChange={() => undefined} options={[['all', `All ${participants.length} participants of ${group}`], ['sel', 'Selected participants only']]} /></Field>
        <div style={{ display: 'flex', gap: 18 }}><Check on onChange={() => undefined}>Print barcode</Check><Check on={false} onChange={() => undefined}>One file per participant</Check></div>
      </Body></Card>
      <Card title="Output"><Body><PathField id="sheetsOutFolder" placeholder="Enter output folder" /></Body></Card>
    </>),
    interp: (<>
      <Card title="Interpret answer sheet" sub="Check how piXeval reads a scanned sheet."><Body>
        <label className="f">Scanned sheet (JPG)</label><PathField id="scanned" placeholder="Select a scanned sheet" mode="file" />
        <div style={{ marginTop: 14 }}><Btn variant="p" icon="scan" onClick={() => setInterpreted(true)}>Interpret</Btn></div>
      </Body></Card>
      {interpreted && sample && (
        <Card title="Reading result" right={<span className="pill c-ok">Recognised</span>}><Body>
          <div className="grid g2" style={{ alignItems: 'start' }}>
            <SheetView p={sample} rows={12} />
            <div>
              <div className="grid g3" style={{ gap: 8, marginBottom: 12 }}>
                <div className="mini"><b>{sample.id}</b><span>Identifier</span></div><div className="mini"><b>1</b><span>Model</span></div><div className="mini"><b>{questions.length}</b><span>Answers read</span></div>
              </div>
              <div className="hint">Marks above reflect the bubbles detected on the scanned image. Faint or double marks would be flagged and listed in Error sheets.</div>
            </div>
          </div>
        </Body></Card>
      )}
    </>),
  }[tab]

  return (<>
    <PageHead title="Sheets management" sub="Generate, anonymise and interpret printable OMR answer sheets." />
    <Tabs tabs={TABS} value={tab} onChange={setTab} />
    {tab !== 'interp' && <ContextBar />}
    <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', alignItems: 'start' }}>
      <div className="grid">{main}</div>
      <div className="grid" style={{ position: 'sticky', top: 80 }}>
        <Card title="Answer sheet format"><Body>
          <Field label="Language"><Select value={lang} onChange={setLang} options={opt(['es Español', 'en English', 'ca Català'])} /></Field>
          <Field label="Sheet type"><Select value={type} onChange={setType} options={opt(['Identifier | 1', 'Barcode | 2', 'Anonymous | 3'])} /></Field>
          <Field label="Format"><Select value={fmt} onChange={setFmt} options={opt(['Exam format', 'A4 compact', 'Letter'])} /></Field>
          <div className="row"><div><label className="f">Questions number</label><Stepper value={q} min={1} max={200} onChange={setQ} /></div><div><label className="f">Answers number</label><Stepper value={a} min={2} max={6} onChange={setA} /></div></div>
          <div style={{ marginTop: 14, display: 'grid', gap: 10 }}><Check on={code} onChange={setCode}>Include barcode</Check><Check on={pname} onChange={setPname}>Print participant name</Check></div>
        </Body></Card>
        <Card style={{ background: 'var(--surface-2)' }}><Body style={{ display: 'grid', gap: 8 }}>
          <Btn variant="p lg" icon="print" style={{ justifyContent: 'center' }} onClick={generate}>Generate</Btn>
          <Btn icon="eye" style={{ justifyContent: 'center' }} onClick={() => open('instructions')}>Instruction preview</Btn>
          {tab === 'anon' && <Btn icon="barcode" style={{ justifyContent: 'center' }} onClick={() => open('barcodes')}>Barcodes</Btn>}
        </Body></Card>
      </div>
    </div>
  </>)
}
