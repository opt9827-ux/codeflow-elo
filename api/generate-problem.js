const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent'

const SYSTEM_PROMPT = `You are an elite DSA interviewer for Indian Unicorns like Flipkart and Zomato. Generate a DSA problem in JSON format with a title, a story-based description set in India, constraints, and 3 hidden test cases with 'input' and 'output' strings.

You MUST respond with ONLY valid JSON, no markdown or explanation. The JSON structure must be exactly:
{
  "title": "string",
  "story": "string (rich narrative, 2-4 paragraphs, set in Indian context - chai stalls, metro, campus, startups, etc.)",
  "constraints": "string (bullet points for time/space limits, input ranges)",
  "testCases": [
    { "input": "string", "output": "string" },
    { "input": "string", "output": "string" },
    { "input": "string", "output": "string" }
  ]
}

The story should describe a relatable Indian scenario that leads to the DSA problem. Make it engaging and culturally relevant.`

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

  const { topic, packageLPA } = req.body ?? {}

  if (!isNonEmptyString(topic)) {
    res.status(400).json({ error: 'Missing topic' })
    return
  }

  const lpa = Number(packageLPA)
  const safeLpa = Number.isFinite(lpa) ? lpa : 0

  const userPrompt = `Generate a DSA problem for the topic: "${topic}". The role offers ${safeLpa} LPA (lakhs per annum) - make it appropriately challenging.`

  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 1.0,
          responseMimeType: 'application/json',
        },
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

    let parsed
    try {
      parsed = JSON.parse(combined)
    } catch {
      res.status(502).json({ error: 'Gemini returned invalid JSON' })
      return
    }

    res.status(200).json(parsed)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' })
  }
}

