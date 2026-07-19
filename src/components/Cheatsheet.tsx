import { Button } from '@/components/ui/button'

interface Props {
  onClose: () => void
}

const sections = [
  {
    title: 'Anchors',
    items: [
      { pattern: '^', desc: 'Start' },
      { pattern: '$', desc: 'End' },
      { pattern: '\\b', desc: 'Word boundary' },
      { pattern: '\\B', desc: 'Not word boundary' },
    ],
  },
  {
    title: 'Classes',
    items: [
      { pattern: '.', desc: 'Any char' },
      { pattern: '\\d', desc: 'Digit' },
      { pattern: '\\D', desc: 'Not digit' },
      { pattern: '\\w', desc: 'Word char' },
      { pattern: '\\W', desc: 'Not word' },
      { pattern: '\\s', desc: 'Whitespace' },
      { pattern: '[abc]', desc: 'Any of a,b,c' },
      { pattern: '[^abc]', desc: 'Not a,b,c' },
      { pattern: '[a-z]', desc: 'Range a-z' },
    ],
  },
  {
    title: 'Quantifiers',
    items: [
      { pattern: '*', desc: '0 or more' },
      { pattern: '+', desc: '1 or more' },
      { pattern: '?', desc: '0 or 1' },
      { pattern: '{n}', desc: 'Exactly n' },
      { pattern: '{n,}', desc: 'n or more' },
      { pattern: '{n,m}', desc: 'n to m' },
    ],
  },
  {
    title: 'Groups & Alt',
    items: [
      { pattern: '(abc)', desc: 'Capture' },
      { pattern: '(?:abc)', desc: 'Non-capture' },
      { pattern: 'a|b', desc: 'Alternation' },
    ],
  },
  {
    title: 'Escapes',
    items: [
      { pattern: '\\t', desc: 'Tab' },
      { pattern: '\\n', desc: 'Newline' },
      { pattern: '\\r', desc: 'CR' },
    ],
  },
]

export default function Cheatsheet({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-12 p-4">
      <div className="w-full max-w-sm rounded-lg border bg-popover shadow-lg">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <h2 className="text-sm font-semibold">Regex Cheatsheet</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-3">
          <div className="flex flex-col gap-3">
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </h3>
                <div className="flex flex-wrap gap-1">
                  {section.items.map((item) => (
                    <div key={item.pattern} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px]">
                      <code className="rounded bg-primary/10 px-1 font-mono text-[10px] text-primary">
                        /{item.pattern}/
                      </code>
                      <span className="text-muted-foreground">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
