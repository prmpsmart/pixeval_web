import { useState } from 'react'
import { Dialog } from '../components/Dialog'
import { Btn, Icon } from '../components/ui'
import { useApp } from '../store/useApp'

const FOLDERS: [string, string][] = [
  ['Desktop', '/Users/miracle-apata/Desktop'],
  ['Documents', '/Users/miracle-apata/Documents'],
  ['Workspace', '/Users/miracle-apata/Documents/Workspace/Aescolan/pixeval'],
  ['extra', '…/pixeval/extra/03-02-2026'],
  ['300ppp2', '…/extra/03-02-2026/300ppp2'],
  ['MIRACLE', '…/extra/05-12-2025/MIRACLE'],
]
const FILES: [string, string][] = [
  ['sheet_omr.db', '/pixeval/extra/18-02-2026/sheet_omr.db'],
  ['grades.xlsx', '/Documents/grades.xlsx'],
  ['template.docx', '/Documents/template.docx'],
  ['scan_0001.jpg', '/pixeval/extra/03-02-2026/300ppp2/scan_0001.jpg'],
]

/** Demo file browser. `arg` is "<pathKey>:<folder|file>"; the chosen path is stored under that key. */
export function PickerDialog({ arg = 'path:folder' }: { arg?: string }) {
  const [key, mode] = arg.split(':')
  const [picked, setPicked] = useState('')
  const { set, close, paths } = useApp()
  const rows = [...FOLDERS.map((r) => [...r, 'folder'] as const), ...(mode === 'file' ? FILES.map((r) => [...r, 'file'] as const) : [])]
  const choose = () => { set({ paths: { ...paths, [key]: picked || FOLDERS[4][1] } }); close() }
  return (
    <Dialog width="w2" icon="folder" title={mode === 'file' ? 'Select file' : 'Select folder'} sub="Demo file browser"
      footer={<div className="r"><Btn onClick={close}>Cancel</Btn><Btn variant="p" onClick={choose}>Select</Btn></div>}>
      <div className="card flush" style={{ boxShadow: 'none' }}>
        {rows.map(([name, path, icon]) => (
          <div key={path} onClick={() => setPicked(path)}
            style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--line-2)', cursor: 'pointer', background: picked === path ? 'var(--brand-soft)' : undefined }}>
            <Icon name={icon} /><b style={{ fontWeight: 600 }}>{name}</b><span className="mono hint" style={{ margin: '0 0 0 auto' }}>{path}</span>
          </div>
        ))}
      </div>
    </Dialog>
  )
}
