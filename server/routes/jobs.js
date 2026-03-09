const express = require('express')
const router = express.Router()
const { jobScraperAgent } = require('../agents/jobScraperAgent')
const db = require('../db')

// POST /api/jobs/search
router.post('/search', async (req, res) => {
  const { query } = req.body

  if (!query || query.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Please provide a search query'
    })
  }

  try {
    console.log(`[Route] Search request for: "${query}"`)
    const jobs = await jobScraperAgent(query.trim())
    res.json({
      success: true,
      count: jobs.length,
      jobs: jobs
    })
  } catch (error) {
    console.error('[Route] Error:', error.message)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// GET /api/jobs/all
router.get('/all', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM jobs ORDER BY created_at DESC LIMIT 50'
    )
    res.json({
      success: true,
      count: result.rows.length,
      jobs: result.rows
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router