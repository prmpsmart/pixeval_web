import { useState } from 'react'
import { Dialog, DialogFooter } from '../components/Dialog'
import { Btn, Field, Input, Select } from '../components/ui'
import { useApp } from '../store/useApp'

export function ParticipantDialog({ arg }: { arg?: string }) {
  const { participants, groups, group, savePart, deletePart, ask, close } = useApp()
  const isNew = arg === 'new'
  const src = isNew ? undefined : participants.find((p) => String(p.sn) === arg)
  const [f, setF] = useState({
    name: src?.name ?? '',
    surnames: src?.surnames ?? '',
    dni: src?.dni ?? '',
    barcode: src?.barcode ?? '',
    email: src?.email ?? '',
    phone: src?.phone ?? '',
    group: src?.group ?? group,
  })
  const field = (k: keyof typeof f) => (v: string) => setF((o) => ({ ...o, [k]: v }))
  if (!isNew && !src)
    return (
      <Dialog width="w1" title="Participant not found">
        <p>This participant no longer exists.</p>
      </Dialog>
    )

  const remove = () =>
    src &&
    ask({
      title: 'Delete participant?',
      message: `${src.surnames}, ${src.name} and their sheet are removed.`,
      ok: 'Delete',
      danger: true,
      done: 'Participant deleted',
      run: () => {
        deletePart(src.sn)
        close()
      },
    })
  return (
    <Dialog
      icon="users"
      title={isNew ? 'New participant' : 'Participant'}
      sub={src ? `S/N ${src.sn} · ${src.group}` : undefined}
      footer={
        <>
          {src && (
            <Btn variant="d" icon="trash" onClick={remove}>
              Delete
            </Btn>
          )}
          <DialogFooter>
            <Btn
              variant="p"
              icon="save"
              onClick={() => {
                savePart(isNew ? 'new' : src!.sn, f)
                close()
              }}
            >
              {isNew ? 'Add participant' : 'Save'}
            </Btn>
          </DialogFooter>
        </>
      }
    >
      <div className="row">
        <Field label="Name">
          <Input value={f.name} onChange={field('name')} placeholder="Name" />
        </Field>
        <Field label="Surnames">
          <Input value={f.surnames} onChange={field('surnames')} placeholder="Surnames" />
        </Field>
      </div>
      <div className="row">
        <Field label="DNI / ID">
          <Input mono value={f.dni} onChange={field('dni')} />
        </Field>
        <Field label="Barcode">
          <Input mono value={f.barcode} onChange={field('barcode')} />
        </Field>
      </div>
      <div className="row">
        <Field label="Email">
          <Input icon="mail" value={f.email} onChange={field('email')} />
        </Field>
        <Field label="Phone">
          <Input value={f.phone} onChange={field('phone')} />
        </Field>
      </div>
      <Field label="Year / group">
        <Select value={f.group} options={groups.map((g) => [g, g])} onChange={field('group')} />
      </Field>
    </Dialog>
  )
}
