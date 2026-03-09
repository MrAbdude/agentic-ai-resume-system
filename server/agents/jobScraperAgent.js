const axios = require('axios')
const db = require('../db')

async function jobScraperAgent(searchQuery) {
  console.log(`[Job Scraper Agent] Searching for: "${searchQuery}"`)

  let apiJobs = []

  try {
    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query: searchQuery + ' India',
        num_pages: '1',
        date_posted: 'week'
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      }
    })

    apiJobs = response.data.data || []
    console.log(`[Job Scraper Agent] Fetched ${apiJobs.length} jobs`)

  } catch (error) {
    console.error('[Job Scraper Agent] API call failed:', error.message)
    throw new Error('Failed to fetch jobs: ' + error.message)
  }

  const savedJobs = []

  for (const job of apiJobs.slice(0, 10)) {
    try {
      const result = await db.query(
        `INSERT INTO jobs (title, company, location, description, apply_link, employment_type, date_posted)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          job.job_title || 'No Title',
          job.employer_name || 'Unknown Company',
          (job.job_city || '') + ', ' + (job.job_country || ''),
          job.job_description ? job.job_description.slice(0, 500) : '',
          job.job_apply_link || '',
          job.job_employment_type || 'Full-time',
          job.job_posted_at_datetime_utc || new Date().toISOString()
        ]
      )
      savedJobs.push(result.rows[0])
    } catch (dbError) {
      console.error('[Job Scraper Agent] DB save failed:', dbError.message)
    }
  }

  console.log(`[Job Scraper Agent] Saved ${savedJobs.length} jobs`)
  return savedJobs
}

async function jobScraperAgentFromResume(resumeId) {
  console.log(`[Job Scraper Agent] Fetching resume skills from DB...`)

  // Step 1: Get parsed resume from database
  const resumeResult = await db.query(
    'SELECT * FROM resumes WHERE id = $1',
    [resumeId]
  )

  if (resumeResult.rows.length === 0) {
    throw new Error('Resume not found in database')
  }

  const resume = resumeResult.rows[0]
  const skills = resume.skills

  console.log(`[Job Scraper Agent] Skills from resume: ${skills.join(', ')}`)

  // Step 2: Build smart search query from top 3 skills
  const topSkills = skills.slice(0, 3).join(' ')
  const searchQuery = topSkills + ' developer'

  console.log(`[Job Scraper Agent] Auto search query: "${searchQuery}"`)

  // Step 3: Run the job search with auto query
  const jobs = await jobScraperAgent(searchQuery)

  return {
    searchQuery,
    jobs
  }
}

module.exports = { jobScraperAgent, jobScraperAgentFromResume }