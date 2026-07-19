import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

interface Props {
  onClose: () => void
}

const sections = [
  {
    title: 'Anchors',
    items: [
      { pattern: '^', desc: 'Start of string' },
      { pattern: '$', desc: 'End of string' },
      { pattern: '\\b', desc: 'Word boundary' },
      { pattern: '\\B', desc: 'Not a word boundary' },
    ],
  },
  {
    title: 'Character Classes',
    items: [
      { pattern: '.', desc: 'Any character (except newline)' },
      { pattern: '\\d', desc: 'Digit (0-9)' },
      { pattern: '\\D', desc: 'Not a digit' },
      { pattern: '\\w', desc: 'Word character (a-z, A-Z, 0-9, _)' },
      { pattern: '\\W', desc: 'Not a word character' },
      { pattern: '\\s', desc: 'Whitespace' },
      { pattern: '\\S', desc: 'Not whitespace' },
      { pattern: '[abc]', desc: 'Any of a, b, or c' },
      { pattern: '[^abc]', desc: 'Not a, b, or c' },
      { pattern: '[a-z]', desc: 'Range from a to z' },
    ],
  },
  {
    title: 'Quantifiers',
    items: [
      { pattern: '*', desc: '0 or more' },
      { pattern: '+', desc: '1 or more' },
      { pattern: '?', desc: '0 or 1 (optional)' },
      { pattern: '{n}', desc: 'Exactly n' },
      { pattern: '{n,}', desc: 'n or more' },
      { pattern: '{n,m}', desc: 'Between n and m' },
    ],
  },
  {
    title: 'Groups & Alternation',
    items: [
      { pattern: '(abc)', desc: 'Capture group' },
      { pattern: '(?:abc)', desc: 'Non-capturing group' },
      { pattern: 'a|b', desc: 'Alternation (a or b)' },
    ],
  },
  {
    title: 'Escapes & Special',
    items: [
      { pattern: '\\', desc: 'Escape special character' },
      { pattern: '\\t', desc: 'Tab' },
      { pattern: '\\n', desc: 'Newline' },
      { pattern: '\\r', desc: 'Carriage return' },
    ],
  },
]

export default function Cheatsheet({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg border bg-popover shadow-lg">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Regex Cheatsheet</h2>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        <ScrollArea className="max-h-[70vh] p-4">
          <div className="flex flex-col gap-6">
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  {section.title}
                </h3>
                <div className="flex flex-col gap-1">
                  {section.items.map((item) => (
                    <div key={item.pattern} className="flex items-center gap-3 rounded-md bg-muted px-3 py-1.5 text-sm">
                      <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">
                        /{item.pattern}/
                      </code>
                      <span className="text-muted-foreground">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
