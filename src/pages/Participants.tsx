import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Btn, Empty, Icon, PageHead, Pager, Pill, Select } from '../components/ui'
import { useApp } from '../store/useApp'

export function ParticipantsOverview() {
  const nav = useNavigate()
  const { subjects, participants, set } = useApp()
  return (
    <>
      <PageHead
        title="Participants overview per subject"
        sub={
          <>
            Total participants: <b>{participants.length}</b>
          </>
        }
      />
      {subjects.length === 0 && <Empty icon="layers">No subjects yet.</Empty>}
      <div className="grid g3">
        {subjects.map((s) => {
          const n = participants.filter((p) => p.subject === s.id).length
          return (
            <a
              key={s.id}
              className="card hov"
              onClick={() => {
                set({ subject: s.id })
                nav(`/participants/${s.id}`)
              }}
            >
              <div className="bd">
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <span
                    className="ic-sq"
                    style={{
                      width: 48,
                      height: 48,
                      background: 'linear-gradient(135deg,#FF7A9C,#FF5C8A)',
                      color: '#fff',
                    }}
                  >
                    <Icon name="users" />
                  </span>
                  <span className="tagid" style={{ marginLeft: 'auto' }}>
                    {s.id}
                  </span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, margin: '16px 0 4px', letterSpacing: '-.02em' }}>
                  {s.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--muted)', fontSize: 13 }}>
                  <span>{`${n} participants`}</span>
                  <b
                    style={{
                      marginLeft: 'auto',
                      color: 'var(--brand)',
                      display: 'flex',
                      gap: 6,
                      alignItems: 'center',
                    }}
                  >
                    View
                    <Icon name="right" />
                  </b>
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </>
  )
}

const PER = 15
export function ParticipantsList() {
  const nav = useNavigate()
  const { subject: routeSubject } = useParams()
  const { subjects, participants, groups, group, set, open, ask, deletePart } = useApp()
  const subject = routeSubject ?? useApp.getState().subject
  const [q, setQ] = useState('')
  const [page, setPage] = useState(0)
  const sub = subjects.find((s) => s.id === subject) ?? subjects[0]

  const list = useMemo(() => {
    const t = q.toLowerCase()
    return participants.filter(
      (p) =>
        p.subject === subject &&
        (!group || p.group === group) &&
        (!t || `${p.name} ${p.surnames} ${p.id} ${p.dni} ${p.email}`.toLowerCase().includes(t)),
    )
  }, [participants, subject, group, q])
  const pg = Math.min(page, Math.max(0, Math.ceil(list.length / PER) - 1))

  return (
    <>
      <PageHead
        title="Participants details"
        sub={`${sub?.name ?? ''} · ${list.length} participants`}
        actions={
          <>
            <Btn icon="back" onClick={() => nav('/participants')}>
              Back
            </Btn>
            <Btn icon="users" onClick={() => open('year-group')}>
              Year / group
            </Btn>
            <Btn icon="down" onClick={() => open('import-participants')}>
              Import
            </Btn>
            <Btn variant="p" icon="plus" onClick={() => open('participant', 'new')}>
              Add participant
            </Btn>
          </>
        }
      />
      <div className="grid" style={{ gridTemplateColumns: '1fr 260px', marginBottom: 16 }}>
        <label className="in">
          <Icon name="search" />
          <input
            placeholder="Search name, ID, DNI, email…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(0)
            }}
          />
        </label>
        <Select
          label="Year / Group:"
          value={group}
          options={groups.map((g) => [g, g])}
          onChange={(g) => {
            set({ group: g })
            setPage(0)
          }}
        />
      </div>
      <div className="card flush">
        <div className="tablewrap" style={{ maxHeight: 'none' }}>
          <table>
            <thead>
              <tr>
                <th className="n">S/N</th>
                <th>ID</th>
                <th>Barcode</th>
                <th>DNI</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Group</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.slice(pg * PER, pg * PER + PER).map((p) => (
                <tr
                  key={p.sn}
                  style={{ cursor: 'pointer' }}
                  onClick={() => open('participant', String(p.sn))}
                >
                  <td className="n mono">{p.sn}</td>
                  <td className="mono">{p.id}</td>
                  <td className="mono">{p.barcode}</td>
                  <td className="mono">{p.dni}</td>
                  <td>
                    <b>{p.surnames}</b>, {p.name}
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{p.email}</td>
                  <td className="mono">{p.phone}</td>
                  <td>
                    <Pill tone="c-blue" plain>
                      {p.group}
                    </Pill>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      className="ib"
                      onClick={() =>
                        ask({
                          title: 'Delete participant?',
                          message: `${p.surnames}, ${p.name} and their sheet are removed.`,
                          ok: 'Delete',
                          danger: true,
                          done: 'Participant deleted',
                          run: () => deletePart(p.sn),
                        })
                      }
                    >
                      <Icon name="trash" />
                    </button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <Empty icon="users">
                      No participant matches.
                      <br />
                      <a
                        style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => open('participant', 'new')}
                      >
                        Add a participant
                      </a>
                    </Empty>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pager page={pg} total={list.length} per={PER} onPage={setPage} />
      </div>
    </>
  )
}
