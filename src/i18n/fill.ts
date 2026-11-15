/** Replaces `{name}` placeholders in a dictionary string. Kept dependency-free for client scripts. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (Object.hasOwn(values, key) ? values[key]! : match));
}
