export const buildPrompt = ({
  topic,
  subject,
  detail,
  revisionMode,
  includeDiagrams,
  includeCharts,
}) => {
  return `You are an exam-notes generator. Return ONLY one valid JSON object matching the OUTPUT FORMAT exactly — no markdown fences, no text before or after it.

INPUT:
- Topic: ${topic}
- Subject: ${subject || "Not specified"}
- Detail level: ${detail || "standard"}
- Revision mode: ${revisionMode ? "ON" : "OFF"}
- Include diagram: ${includeDiagrams ? "YES" : "NO"}
- Include charts: ${includeCharts ? "YES" : "NO"}

CONTENT RULES:
- Clear, exam-oriented language. No storytelling or filler theory.
- "notes" is a Markdown string with ## section headings, bullet points and short paragraphs.
- The notes must be COMPLETE enough that a student can prepare for the exam from them alone: cover definitions, explanations, examples, formulas, comparisons, common mistakes and exam tips wherever relevant.
- Detail level controls depth:
  - brief = 200-350 words, key points and definitions only.
  - standard = 500-800 words, every concept explained with at least one example.
  - detailed = 900-1400 words, in-depth coverage: all concepts, examples, formulas, edge cases, common mistakes and exam tips.
- If revision mode is ON, "notes" becomes a last-day cheat sheet: only bullet points, one-line answers, definitions, formulas and keywords — no paragraphs. "revisionPoints" must cover ALL key facts.
- "revisionPoints": 8-15 points. "questions": 4-6 short and 2-4 long questions.
- Rank "subTopics" by exam weightage, 3-6 items per category where possible. A category may be an empty array if nothing fits.
- "importance" is the overall exam importance of the whole topic.

DIAGRAM RULES:
- If include diagram is YES: "diagram" is ONE SINGLE-LINE string of valid Mermaid flowchart, starting with "graph TD;".
- 5-8 nodes forming a clear step-by-step process or hierarchy.
- Node ids MUST be single uppercase letters (A, B, C, D...).
- Node labels MUST be short (2-4 words max) with ONLY alphanumeric characters and spaces — NO brackets, parentheses, colons, quotes or linebreaks. Example: "graph TD; A[User Input] --> B[Processing Engine]; B --> C[Database Storage]; B --> D[Output Display];"
- If include diagram is NO: "diagram" is "".

CHART RULES:
- If include charts is YES: Generate EXACTLY 2 complementary charts in the "charts" array:
  1. Chart 1 (Pie Chart): "type": "pie", "title": "${topic} Exam Weightage Breakdown", "data": 4-5 items with short names (1-3 words max, e.g. "Deadlocks", "CPU Scheduling", "Memory Mgmt", "File Systems") and integer values representing weightage percentage summing to 100 (e.g. [{"name": "CPU Scheduling", "value": 30}, {"name": "Deadlocks", "value": 25}, {"name": "Memory Mgmt", "value": 25}, {"name": "File Systems", "value": 20}]).
  2. Chart 2 (Bar Chart): "type": "bar", "title": "${topic} Marks & Complexity Score", "data": 4-5 items with short names (1-3 words max) and integer scores out of 100 (e.g. [{"name": "Deadlocks", "value": 85}, {"name": "Scheduling", "value": 75}, {"name": "Memory", "value": 90}, {"name": "Storage", "value": 60}]).
- Keep all "name" strings SHORT (1-3 words max) so they fit inside chart legends without overlapping.
- If include charts is NO: "charts" is [].

OUTPUT FORMAT (exact keys and value types):
{
  "importance": "high" | "medium" | "low",
  "subTopics": {
    "frequentlyAsked": ["string"],
    "veryImportant": ["string"],
    "important": ["string"]
  },
  "notes": "markdown string",
  "revisionPoints": ["string"],
  "questions": {
    "short": ["string"],
    "long": ["string"]
  },
  "diagram": "mermaid string or empty string",
  "charts": [
    { "type": "pie", "title": "string", "data": [{ "name": "string", "value": 30 }] },
    { "type": "bar", "title": "string", "data": [{ "name": "string", "value": 85 }] }
  ]
}`;
};

export const buildQuizPrompt = ({ topic, notes, subTopics }) => {
  return `You are an exam quiz generator. Return ONLY one valid JSON object matching the OUTPUT FORMAT exactly — no markdown fences, no text before or after it.

Create a multiple-choice quiz from these study notes.

TOPIC: ${topic}

SUB TOPICS: ${JSON.stringify(subTopics || {})}

NOTES:
${notes}

QUIZ RULES:
- Exactly 10 questions covering the whole note, hardest concepts included.
- Every question has exactly 4 options with exactly ONE correct answer.
- Wrong options must be plausible (common mistakes, close values) — never obviously silly.
- "answerIndex" is the 0-based index of the correct option.
- "explanation" is 1-2 lines explaining why the correct answer is right.
- Questions must be answerable from the notes alone. No "all of the above".

OUTPUT FORMAT (exact keys and value types):
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answerIndex": 0,
      "explanation": "string"
    }
  ]
}`;
};
