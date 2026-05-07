const BLOCKED_WORDS = [
  'fuck', 'shit', 'asshole', 'bitch', 'bastard',
  'idiot', 'stupid', 'hate', 'kill', 'die',
  // Füge hier mehr Wörter hinzu wenn nötig
]

export async function moderateMessage(text: string): Promise<boolean> {
  const lower = text.toLowerCase()
  const isBlocked = BLOCKED_WORDS.some((word) => lower.includes(word))
  return !isBlocked
}