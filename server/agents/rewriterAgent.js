const axios = require('axios')
const db = require('../db')

async function rewriterAgent(jobId, resumeId) {
  console.log(`[Rewriter Agent] Starting rewrite for job ${jobId}`)

  // Step 1: Get job from database
  const jobResult = await db.query(
    'SELECT * FROM jobs WHERE id = $1',
    [jobId]
  )

  if (jobResult.rows.length === 0) {
    throw new Error('Job not found')
  }

  const job = jobResult.rows[0]
  console.log(`[Rewriter Agent] Job: ${job.title} at ${job.company}`)

  // Step 2: Get resume from database
  const resumeResult = await db.query(
    'SELECT * FROM resumes WHERE id = $1',
    [resumeId]
  )

  if (resumeResult.rows.length === 0) {
    throw new Error('Resume not found')
  }

  const resume = resumeResult.rows[0]
  console.log(`[Rewriter Agent] Resume: ${resume.file_name}`)

  // Step 3: Send to Groq AI for rewriting
  console.log('[Rewriter Agent] Sending to Groq AI...')

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: `You are an expert resume writer. Rewrite the resume bullets to match the job description keywords and requirements. Return ONLY a valid JSON object with no extra text, no markdown, no code blocks.

The JSON must have exactly these fields:
{
  "rewritten_bullets": [
    "bullet point 1",
    "bullet point 2",
    "bullet point 3",
    "bullet point 4",
    "bullet point 5"
  ],
  "keywords_added": ["keyword1", "keyword2", "keyword3"],
  "tip": "one short tip for this application"
}

Job Title: ${job.title}
Company: ${job.company}
Job Description: ${job.description}

Candidate Skills: ${resume.skills.join(', ')}
Candidate Experience: ${resume.experience}
Candidate Education: ${resume.education}`
          }
        ],
        temperature: 0.7,
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
    console.log('[Rewriter Agent] Groq replied successfully')

    const rewrittenData = JSON.parse(groqReply)

    console.log(`[Rewriter Agent] Rewrite complete ✅`)

    return {
      job: {
        title: job.title,
        company: job.company,
        description: job.description
      },
      resume: {
        skills: resume.skills,
        experience: resume.experience,
        education: resume.education
      },
      rewritten_bullets: rewrittenData.rewritten_bullets,
      keywords_added: rewrittenData.keywords_added,
      tip: rewrittenData.tip
    }

  } catch (error) {
    console.error('[Rewriter Agent] Groq API failed:', error.message)
    throw new Error('AI rewriting failed: ' + error.message)
  }
}

module.exports = { rewriterAgent }