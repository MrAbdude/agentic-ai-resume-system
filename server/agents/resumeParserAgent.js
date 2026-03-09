const pdfParse = require('pdf-parse')
const axios = require('axios')
const db = require('../db')

async function resumeParserAgent(fileBuffer, fileName) {
  console.log(`[Parser Agent] Starting to parse: ${fileName}`)

  // Step 1: Extract raw text from PDF
  let rawText = ''

  try {
    const pdfData = await pdfParse(fileBuffer)
    rawText = pdfData.text
    console.log(`[Parser Agent] Extracted ${rawText.length} characters from PDF`)
  } catch (error) {
    console.error('[Parser Agent] PDF reading failed:', error.message)
    throw new Error('Could not read PDF file: ' + error.message)
  }

  // Step 2: Send raw text to Groq AI
  console.log('[Parser Agent] Sending text to Groq AI...')

  let parsedData = {}

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
           content: `You are a resume parser. Extract information from this resume text and return ONLY a valid JSON object with no extra text, no markdown, no code blocks. Just pure JSON.

The JSON must have exactly these fields:
{
  "skills": ["skill1", "skill2", "skill3"],
  "experience": "X years of experience in...",
  "education": "Degree, Institution, Year"
}

Rules for skills extraction:
1. Include all skills from the Technical Skills section
2. Include all technologies used in Projects section
3. Include frameworks, libraries, databases, tools mentioned anywhere
4. Remove duplicates
5. Each skill should be a clean single technology name like "React.js" not "React.js framework"

Resume text:
${rawText.slice(0, 3000)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const groqReply = response.data.choices[0].message.content
    console.log('[Parser Agent] Groq replied successfully')

    // Step 3: Parse Groq response as JSON
    parsedData = JSON.parse(groqReply)
    console.log(`[Parser Agent] Skills found: ${parsedData.skills.join(', ')}`)

  } catch (error) {
    console.error('[Parser Agent] Groq API failed:', error.message)
    throw new Error('AI parsing failed: ' + error.message)
  }

  // Step 4: Save to PostgreSQL
  try {
    const result = await db.query(
      `INSERT INTO resumes (file_name, raw_text, skills, experience, education)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        fileName,
        rawText,
        JSON.stringify(parsedData.skills),
        parsedData.experience,
        parsedData.education
      ]
    )

    console.log('[Parser Agent] Resume saved to database ✅')
    return result.rows[0]

  } catch (error) {
    console.error('[Parser Agent] Database save failed:', error.message)
    throw new Error('Failed to save resume: ' + error.message)
  }
}

module.exports = { resumeParserAgent }