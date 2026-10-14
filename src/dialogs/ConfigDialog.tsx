import { useState } from 'react'
import { Dialog, DialogFooter } from '../components/Dialog'
import { Btn, Check, Drop, Field, Icon, Input, Select, Stepper, Tabs, TextArea } from '../components/ui'
import { PathField } from '../components/PathField'
import { useApp } from '../store/useApp'

type Tab = 'general' | 'email' | 'exam' | 'cat'
const TABS = [
  { id: 'general' as const, label: 'General configuration' }, { id: 'email' as const, label: 'Email configuration' },
  { id: 'exam' as const, label: 'Exam configuration' }, { id: 'cat' as const, label: 'CAT configuration' },
]
const opts = (xs: string[]): [string, string][] => xs.map((x) => [x, x])

function General() {
  const [f, setF] = useState({ center: 'Fuenlabrada', words: 'None, All the previous ones, Option, Questions, a), b), c), d)', qd: '.', ad: ')' })
  return (<>
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 26 }}>
      <div><label className="f">Center logo</label><Drop title="Drop logo" /></div>
      <div>
        <Field label="Center name"><Input value={f.center} onChange={(v) => setF({ ...f, center: v })} /></Field>
        <Field label="Detect words to shuffle Y/N"><Input value={f.words} onChange={(v) => setF({ ...f, words: v })} /></Field>
        <div className="row"><div style={{ width: 130, flex: 'none' }}><Field label="Questions delimiter"><Input value={f.qd} onChange={(v) => setF({ ...f, qd: v })} /></Field></div>
          <div style={{ width: 130, flex: 'none' }}><Field label="Answers delimiter"><Input value={f.ad} onChange={(v) => setF({ ...f, ad: v })} /></Field></div></div>
      </div>
    </div>
    <hr className="s" />
    <Field label="Alternative directory H/R"><PathField id="altHR" placeholder="Alternative path to H/R directory" /></Field>
    <Field label="Alternative directory H/I"><PathField id="altHI" placeholder="Alternative path to H/I directory" /></Field>
  </>)
}

function Email() {
  const [f, setF] = useState({ conn: 'None', server: '', port: '', user: '', pass: '', sender: '', name: '', subject: '' })
  const [body, setBody] = useState('{participante}\nModelo: {modelo}\nNota (max. 10): {nota} Bien: {aciertos}, Mal: {fallos}, En blanco: {enBlanco}')
  const { toast } = useApp()
  const up = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v })
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 26 }}>
      <div>
        <Select label="Connection type:" value={f.conn} onChange={up('conn')} options={opts(['None', 'SSL', 'TLS'])} />
        <div style={{ height: 12 }} />
        <div className="row"><Field label="Server"><Input value={f.server} onChange={up('server')} placeholder="Enter server url" /></Field>
          <div style={{ flex: '0 0 90px' }}><Field label="Port"><Input value={f.port} onChange={up('port')} placeholder="port" /></Field></div></div>
        <Field label="User"><Input value={f.user} onChange={up('user')} placeholder="Enter user email" /></Field>
        <Field label="Password"><Input icon="key" type="password" value={f.pass} onChange={up('pass')} placeholder="Enter password" /></Field>
        <Field label="Sender"><Input value={f.sender} onChange={up('sender')} placeholder="Enter sender email" /></Field>
        <Field label="Name"><Input value={f.name} onChange={up('name')} placeholder="Enter name" /></Field>
        <Field label="Email subject"><Input value={f.subject} onChange={up('subject')} placeholder="Enter mail subject" /></Field>
      </div>
      <div>
        <label className="f">Email body</label>
        <TextArea rows={12} value={body} onChange={setBody} />
        <div className="hint">Placeholders: {'{participante} {modelo} {nota} {aciertos} {fallos} {enBlanco}'}</div>
        <div style={{ marginTop: 12 }}><Btn icon="send" onClick={() => toast('Test mail sent', 'to prmpsmart@gmail.com')}>Send test mail</Btn></div>
      </div>
    </div>
  )
}

function ExamConfig() {
  const [instr, setInstr] = useState('')
  const [fmt, setFmt] = useState('PDF'), [lang, setLang] = useState('Spanish'), [hdr, setHdr] = useState('Standard')
  const [flags, setFlags] = useState<Record<string, boolean>>({ blank: true })
  const flag = (k: string, label: string) => <Check key={k} on={!!flags[k]} onChange={(v) => setFlags({ ...flags, [k]: v })}>{label}</Check>
  return (<>
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 26 }}>
      <div><label className="f">Exam header</label><Drop title="Drop your header image here" /></div>
      <div><label className="f">Exam instructions <span style={{ color: 'var(--brand)' }}>RTE</span></label><TextArea rows={8} value={instr} onChange={setInstr} placeholder="Enter exam instructions" /></div>
    </div>
    <hr className="s" />
    <div className="sec-t">Page options</div>
    <div className="grid g3" style={{ gap: 12, marginBottom: 14 }}>
      <Select label="Format:" value={fmt} onChange={setFmt} options={opts(['PDF', 'DOCX'])} />
      <Select label="Language:" value={lang} onChange={setLang} options={opts(['Spanish', 'English', 'Catalan'])} />
      <Select label="Header type:" value={hdr} onChange={setHdr} options={opts(['Standard', 'Compact'])} />
    </div>
    <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
      {flag('hi', 'Highlight questions')}{flag('dc', 'Double column format')}{flag('si', 'Separate instructions')}{flag('ls', 'Large letter size')}{flag('es', 'Extra separation')}
    </div>
    <hr className="s" />
    <div className="sec-t">Grading options</div>
    {flag('blank', 'More than one alternative: blank?')}
  </>)
}

function Slider({ label, value, min, max, onChange, reset }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; reset: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr 50px 28px', gap: 14, alignItems: 'center', padding: '12px 0' }}>
      <b>{label}</b>
      <input className="range" type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <b style={{ textAlign: 'right' }}>{value}</b>
      <button className="ib" title="Reset" onClick={() => onChange(reset)}><Icon name="refresh" /></button>
    </div>
  )
}

function Cat() {
  const [type, setType] = useState('CAT2')
  const [v, setV] = useState({ up: 75, lo: 25, pm: 5, tm: 60, row: 0, col: 0 })
  const [multi, setMulti] = useState(true)
  return (<>
    <Select label="CAT Type:" value={type} onChange={setType} options={opts(['CAT2', 'CAT3', 'CAT3x'])} />
    <div className="sec-t" style={{ marginTop: 18, color: 'var(--brand)' }}>{type}</div>
    <div className="card" style={{ boxShadow: 'none', padding: '0 18px' }}>
      <Slider label="Upper threshold" value={v.up} min={0} max={100} reset={75} onChange={(x) => setV({ ...v, up: x })} />
      <Slider label="Lower threshold" value={v.lo} min={0} max={100} reset={25} onChange={(x) => setV({ ...v, lo: x })} />
      <Slider label="Permissiveness" value={v.pm} min={0} max={8} reset={5} onChange={(x) => setV({ ...v, pm: x })} />
      <Slider label="Threshold marking" value={v.tm} min={0} max={100} reset={60} onChange={(x) => setV({ ...v, tm: x })} />
    </div>
    <div className="sec-t" style={{ marginTop: 18 }}>Emergency correction</div>
    <div className="card" style={{ boxShadow: 'none' }}><div className="bd row" style={{ padding: '14px 18px', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><b>Start row</b><Stepper value={v.row} max={50} onChange={(x) => setV({ ...v, row: x })} /></div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><b>Start column</b><Stepper value={v.col} max={50} onChange={(x) => setV({ ...v, col: x })} /></div>
    </div></div>
    <div style={{ marginTop: 14 }}><Check on={multi} onChange={setMulti}>Allow questions with more than one correct answer</Check></div>
  </>)
}

export function ConfigDialog() {
  const [tab, setTab] = useState<Tab>('general')
  const { saving, toast, close } = useApp()
  return (
    <Dialog width="w4" icon="cog" title="Configurations"
      footer={<DialogFooter><Btn variant="p" icon="save" onClick={() => { toast('Configuration saved', saving ? 'Persisted to sheet_omr.db' : 'Not saving to DB'); close() }}>Save to DB</Btn></DialogFooter>}>
      <Tabs pill tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'general' && <General />}{tab === 'email' && <Email />}{tab === 'exam' && <ExamConfig />}{tab === 'cat' && <Cat />}
    </Dialog>
  )
}
