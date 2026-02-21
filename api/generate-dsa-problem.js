const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent'

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!isNonEmptyString(apiKey)) {
    res.status(500).json({ error: 'Missing GEMINI_API_KEY server env var' })
    return
  }

  const { node } = req.body ?? {}
  if (!node || typeof node !== 'object') {
    res.status(400).json({ error: 'Missing node' })
    return
  }

  const { id, title, subtitle, cityTag, difficulty } = node
  if (![id, title, subtitle, cityTag, difficulty].every(isNonEmptyString)) {
    res.status(400).json({ error: 'Invalid node payload' })
    return
  }

  const systemPrompt =
    'You are an Indian placement-focussed DSA trainer. You create structured coding problems that feel like real campus drive questions from Indian companies.'

  const userPrompt = `
Generate ONE ${difficulty} level data structures and algorithms coding problem.

Theme it around Indian college life, tech fests, metros, chai breaks, and campus placements.

Node metadata:
- Node: ${title} (${id})
- Vibe: ${subtitle}
- Typical city / role: ${cityTag}

Hard constraints:
- Language agnostic problem statement (but student will usually solve in C++).
- Stick to classical DSA topics: arrays, prefix sums, hashing, DP, graphs, trees, stacks/queues, greedy, etc.
- Make it suitable for a 45–60 minute interview round.
- Provide small but meaningful constraints.

Format your answer in markdown with the following headings in this exact order:
1. Title
2. Story
3. Problem
4. Input Format
5. Output Format
6. Constraints
7. Sample Input
8. Sample Output
9. Explanation

Keep the total length under 350 words.
`.trim()

  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      res.status(502).json({ error: `Gemini API error: ${response.status} ${text}` })
      return
    }

    const data = await response.json()
    const parts = data?.candidates?.[0]?.content?.parts ?? []
    const combined = parts
      .map((p) => p?.text)
      .filter((t) => typeof t === 'string')
      .join('\n')
      .trim()

    if (!combined) {
      res.status(502).json({ error: 'Gemini returned empty content' })
      return
    }

    res.status(200).json({ markdown: combined })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' })
  }
}

