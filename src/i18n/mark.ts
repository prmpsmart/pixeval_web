/**
 * Marks a string that is not covered by the automatic rules (see tools/i18n/analyze.mjs) as translatable.
 * At build time the plugin replaces `tr('text')` with a lookup; the function below is only the type signature.
 */
export const tr = (text: string): string => text
