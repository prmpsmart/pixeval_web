import type { ComponentProps } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Btn, Card, Empty, Icon, PageHead } from '../components/ui'
import { findDoc, getDocs } from '../lib/research'

/** `05-comparison-and-roadmap.md` or `README.md#x` → route id, otherwise undefined. */
const docLink = (href?: string) => /^([\w.-]+)\.md(#.*)?$/.exec(href ?? '')?.[1]

function A({ href, children }: ComponentProps<'a'>) {
  const id = docLink(href)
  if (id) return <Link to={id === 'README' ? '/research' : `/research/${id}`}>{children}</Link>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

/** Wide tables scroll sideways instead of breaking the layout. */
const Table = (props: ComponentProps<'table'>) => (
  <div className="prose-table">
    <table {...props} />
  </div>
)

export function Research() {
  const { doc: id } = useParams()
  const nav = useNavigate()
  const docs = getDocs()
  const current = findDoc(docs, id)

  return (
    <>
      <PageHead
        title="Research"
        sub="How the new interface could be built: options, measurements and recommendation."
        actions={
          current && current.id !== 'README' ? (
            <Btn icon="back" onClick={() => nav('/research')}>
              Research index
            </Btn>
          ) : undefined
        }
      />
      <div className="research">
        <nav className="research-nav card">
          <div className="sec-t" style={{ padding: '14px 16px 0' }}>
            Documents
          </div>
          {docs.map((d) => (
            <Link
              key={d.id}
              to={d.id === 'README' ? '/research' : `/research/${d.id}`}
              className={d.id === (current?.id ?? '') ? 'on' : ''}
            >
              <Icon name="file" />
              <span>{d.label}</span>
            </Link>
          ))}
        </nav>
        <Card>
          {current ? (
            <article className="prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: A, table: Table }}>
                {current.body}
              </ReactMarkdown>
            </article>
          ) : (
            <Empty icon="file">
              This document does not exist. <Link to="/research">Back to the index</Link>
            </Empty>
          )}
        </Card>
      </div>
    </>
  )
}
