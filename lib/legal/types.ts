export type Block =
  | string
  | { list: string[] }
  | { rows: [string, string][] }
  | { note: string }
  | { link: { href: string; label: string } }

export type PolicySection = { heading: string; blocks: Block[] }

export type PolicyDoc = {
  title: string
  description: string
  intro: string
  sections: PolicySection[]
}
