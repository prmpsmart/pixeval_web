import { useMemo, useState } from 'react'
import { Btn, Card, Empty, Icon, PageHead, Pager, Pill, Select, Tag } from '../components/ui'
import { SubjectSelect } from '../components/ContextBar'
import { difficulty, difficultyLabel, levelTone } from '../lib/domain'
import { useSubjectData } from '../lib/hooks'
import { useApp } from '../store/useApp'

const PER = 20

export function Questions() {
  const data = useApp()
  const { open, ask, deleteQuestion } = data
  const { questions, topics } = useSubjectData()
  const [q, setQ] = useState(''),
    [level, setLevel] = useState('all'),
    [key, setKey] = useState('all'),
    [page, setPage] = useState(0)

  const list = useMemo(() => {
    const t = q.toLowerCase()
    return questions.filter(
      (x) =>
        (!t || x.text.toLowerCase().includes(t) || String(x.id) === t) &&
        (level === 'all' || difficultyLabel(data, x) === level) &&
        (key === 'all' || x.key === key),
    )
  }, [questions, q, level, key, data])
  const pg = Math.min(page, Math.max(0, Math.ceil(list.length / PER) - 1))
  const reset =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v)
      setPage(0)
    }

  return (
    <>
      <PageHead
        title="Questions"
        sub={`${questions.length} questions in the bank for ${data.subject}`}
        actions={
          <>
            <Btn icon="search" onClick={() => open('search-questions')}>
              Search
            </Btn>
            <Btn icon="refresh" onClick={() => open('update-questions')}>
              Update DB
            </Btn>
            <Btn icon="down" onClick={() => open('import-questions')}>
              Import
            </Btn>
            <Btn icon="up" onClick={() => open('export-questions')}>
              Export
            </Btn>
            <Btn variant="p" icon="plus" onClick={() => open('question', 'new')}>
              New question
            </Btn>
          </>
        }
      />
      <div
        className="grid"
        style={{ gridTemplateColumns: '1.2fr 1fr 150px 130px', marginBottom: 16, alignItems: 'center' }}
      >
        <SubjectSelect />
        <label className="in">
          <Icon name="search" />
          <input
            placeholder="Filter by text or ID…"
            value={q}
            onChange={(e) => reset(setQ)(e.target.value)}
          />
        </label>
        <Select
          label="Difficulty:"
          value={level}
          onChange={reset(setLevel)}
          options={[
            ['all', 'All'],
            ['Easy', 'Easy'],
            ['Medium', 'Medium'],
            ['Hard', 'Hard'],
          ]}
        />
        <Select
          label="Key:"
          value={key}
          onChange={reset(setKey)}
          options={[
            ['all', 'Any'],
            ['a', 'a'],
            ['b', 'b'],
            ['c', 'c'],
          ]}
        />
      </div>
      <Card flush>
        <div className="tablewrap" style={{ maxHeight: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Question</th>
                <th>Key</th>
                <th>Difficulty</th>
                <th className="n">% correct</th>
                <th>Topic</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.slice(pg * PER, pg * PER + PER).map((x) => {
                const level = difficultyLabel(data, x)
                return (
                  <tr key={x.id} style={{ cursor: 'pointer' }} onClick={() => open('question', String(x.id))}>
                    <td className="mono">{x.id}</td>
                    <td>{x.text}</td>
                    <td>
                      <span style={{ textTransform: 'uppercase' }}>
                        <Tag>{x.key}</Tag>
                      </span>
                    </td>
                    <td>
                      <Pill tone={levelTone[level]}>{level}</Pill>
                    </td>
                    <td className="n">{Math.round(difficulty(data, x) * 100)}%</td>
                    <td>{(topics.find((t) => t.id === x.topic)?.name ?? '—').slice(0, 26)}</td>
                    <td style={{ whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                      <button className="ib" title="Edit" onClick={() => open('question', String(x.id))}>
                        <Icon name="edit" />
                      </button>
                      <button
                        className="ib"
                        title="Exam history"
                        onClick={() => open('question-exams', String(x.id))}
                      >
                        <Icon name="hist" />
                      </button>
                      <button
                        className="ib"
                        title="Modification history"
                        onClick={() => open('question-history', String(x.id))}
                      >
                        <Icon name="layers" />
                      </button>
                      <button
                        className="ib"
                        title="Delete"
                        onClick={() =>
                          ask({
                            title: `Delete question ${x.id}?`,
                            message: 'It is removed from the bank and from every sheet.',
                            ok: 'Delete',
                            danger: true,
                            done: 'Question deleted',
                            run: () => deleteQuestion(x.id),
                          })
                        }
                      >
                        <Icon name="trash" />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {!list.length && (
                <tr>
                  <td colSpan={7}>
                    <Empty icon="search">No question matches these filters.</Empty>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pager page={pg} total={list.length} per={PER} onPage={setPage} />
      </Card>
    </>
  )
}
