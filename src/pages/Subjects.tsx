import { useNavigate } from 'react-router-dom'
import { Btn, Card, Body, Empty, Icon, Mini, PageHead, Tag } from '../components/ui'
import { SubjectSelect } from '../components/ContextBar'
import { useApp } from '../store/useApp'

export function Subjects() {
  const nav = useNavigate()
  const { subjects, subject, topics, questions, participants, open, ask, deleteSubject } = useApp()
  const s = subjects.find((x) => x.id === subject) ?? subjects[0]
  if (!s) {
    return (<><PageHead title="Subject details" />
      <Empty icon="layers">No subjects yet. <a style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }} onClick={() => open('subject')}>Create the first subject</a></Empty></>)
  }
  const mine = topics.filter((t) => t.subject === s.id)
  const nq = questions.filter((q) => q.subject === s.id).length
  const np = participants.filter((p) => p.subject === s.id).length
  const remove = () => ask({
    title: `Delete subject ${s.id}?`, message: 'Its topics, questions, participants and exams are deleted too.', ok: 'Delete', danger: true,
    done: 'Subject deleted', run: () => deleteSubject(s.id),
  })
  return (<>
    <PageHead title="Subject details" sub="View and edit subject details" actions={<Btn variant="p" icon="plus" onClick={() => open('subject')}>New subject</Btn>} />
    <div className="grid" style={{ gridTemplateColumns: '1.2fr 1fr', alignItems: 'start' }}>
      <div className="grid">
        <div style={{ maxWidth: 520 }}><SubjectSelect /></div>
        <Card><Body>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span className="ic-sq" style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg,#4C7DFF,#7A5AF8)', color: '#fff' }}><Icon name="book" /></span>
            <div><Tag>{s.id}</Tag><div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', marginTop: 4 }}>{s.name}</div></div>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <Btn variant="sm" icon="edit" onClick={() => open('subject', s.id)}>Edit</Btn>
              <Btn variant="sm d" icon="trash" onClick={remove}>Delete</Btn>
            </span>
          </div>
          <hr className="s" />
          <div className="grid g3">
            <a className="mini hov" onClick={() => nav('/participants/' + s.id)}><b>{np}</b><span>Participants</span></a>
            <Mini value={mine.length} label="Topics" />
            <a className="mini hov" onClick={() => nav('/questions')}><b>{nq}</b><span>Questions</span></a>
          </div>
          <hr className="s" />
          <div className="sec-t">Jump to</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Btn icon="help" onClick={() => nav('/questions')}>Questions</Btn><Btn icon="users" onClick={() => nav('/participants/' + s.id)}>Participants</Btn>
            <Btn icon="file" onClick={() => nav('/exams')}>Exams</Btn><Btn icon="users" onClick={() => open('year-group')}>Year / groups</Btn>
          </div>
        </Body></Card>
      </div>
      <Card title="Topics" right={<Btn variant="sm" icon="plus" onClick={() => open('topic')}>Add topic</Btn>}>
        <Body><div style={{ display: 'grid', gap: 10 }}>
          {mine.map((t) => (
            <div key={t.id} className="card hov" style={{ boxShadow: 'none', borderLeft: '4px solid var(--violet)' }}>
              <div className="bd" style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}><b style={{ fontSize: 14.5, flex: 1 }}>{t.name}</b>
                  <button className="ib" onClick={() => open('topic', String(t.id))}><Icon name="edit" /></button></div>
                <div style={{ display: 'flex', gap: 18, color: 'var(--muted)', fontSize: 12.5, marginTop: 10 }}>
                  <span>ID <b style={{ color: 'var(--ink)' }}>{t.id}</b></span><span>Chapter <b style={{ color: 'var(--ink)' }}>{t.chapter}</b></span>
                  <span>Questions <b style={{ color: 'var(--ink)' }}>{questions.filter((q) => q.topic === t.id).length}</b></span>
                </div>
              </div>
            </div>
          ))}
          {!mine.length && <Empty icon="layers">No topics yet. Add the first topic for this subject.</Empty>}
        </div></Body>
      </Card>
    </div>
  </>)
}
