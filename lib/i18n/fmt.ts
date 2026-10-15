// fmt("{shown} of {total}", { shown: 2, total: 7 }) → "2 of 7"
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match))
}
