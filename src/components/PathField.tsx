import { Btn } from './ui'
import { useApp } from '../store/useApp'

/** Folder/file chooser: a button that opens the demo file browser plus the chosen path. */
export function PathField({
  id,
  placeholder,
  mode = 'folder',
}: {
  id: string
  placeholder: string
  mode?: 'folder' | 'file'
}) {
  const path = useApp((s) => s.paths[id])
  const open = useApp((s) => s.open)
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Btn icon="folder" onClick={() => open('picker', `${id}:${mode}`)}>
        {mode === 'file' ? 'Select file' : 'Select folder'}
      </Btn>
      <div
        className={`in ${path ? 'mono' : 'ph-t'}`}
        style={{ flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}
      >
        {path ?? placeholder}
      </div>
    </div>
  )
}
