import { useSyncExternalStore } from 'react'

export type LangCode = 'en' | 'es' | 'fr' | 'gl' | 'ca' | 'eu'

/** Interface languages (names in their own language). */
export const LANGS: { code: LangCode; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'gl', name: 'Galego' },
  { code: 'ca', name: 'Català' },
  { code: 'eu', name: 'Euskara' },
]

const loaders = import.meta.glob('./locales/*.json', { import: 'default' }) as Record<
  string,
  () => Promise<Record<string, string>>
>

let lang: LangCode = 'en'
let dict: Record<string, string> = {}
const listeners = new Set<() => void>()

const STORAGE_KEY = 'pixeval-lang'
/** Developer aid: `?pseudo` wraps every translated text in ⟦ ⟧ so untranslated text is easy to spot. */
const pseudo = typeof location !== 'undefined' && /[?&]pseudo\b/.test(location.search)

export const getLanguage = () => lang

/** The language in the URL (`?lang=eu`), else the one the user chose last (English by default). */
export function savedLanguage(): LangCode {
  const fromUrl = new URLSearchParams(location.search).get('lang') as LangCode | null
  if (fromUrl && LANGS.some((l) => l.code === fromUrl)) return fromUrl
  try {
    const code = localStorage.getItem(STORAGE_KEY) as LangCode | null
    if (code && LANGS.some((l) => l.code === code)) return code
  } catch {
    /* storage unavailable */
  }
  return 'en'
}

/** Load a language and notify the UI. English needs no dictionary. */
export async function setLanguage(code: LangCode): Promise<void> {
  const load = loaders[`./locales/${code}.json`]
  dict = code !== 'en' && load ? await load() : {}
  lang = code
  document.documentElement.lang = code
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l())
}

/** Re-renders a component tree when the language changes. */
export const useLanguage = () =>
  useSyncExternalStore(
    (cb) => (listeners.add(cb), () => listeners.delete(cb)),
    () => lang,
  )

const fill = (text: string, vars?: Record<string, unknown>) =>
  vars ? text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : text

/**
 * Translation lookup used by the build-time transform. `key` is the English text with `{name}` placeholders;
 * a key with a `|` holds the singular and plural forms, chosen by `count`.
 */
export function __t(key: string, vars?: Record<string, unknown>, count?: number): string {
  const entry = dict[key] ?? key
  let out: string
  if (count === undefined) out = fill(entry, vars)
  else {
    const forms = entry.split('|')
    const one = new Intl.PluralRules(lang).select(count) === 'one'
    out = fill(one || forms.length < 2 ? forms[0] : forms[1], vars)
  }
  return pseudo ? `⟦${out}⟧` : out
}

/** Translate a label that is displayed from data (tab names, option labels, nav items). Unknown text is returned unchanged. */
export const translate = (text: string): string => (pseudo ? `⟦${dict[text] ?? text}⟧` : (dict[text] ?? text))
