const express = require('express')
const router = express.Router()
const multer = require('multer')
const { resumeParserAgent } = require('../agents/resumeParserAgent')
const { jobScraperAgentFromResume } = require('../agents/jobScraperAgent')
const db = require('../db')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'))
    }
  }
})

// POST /api/resume/upload
// Step 1: Parse resume
// Step 2: Auto search jobs based on skills
router.post('/upload', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded'
    })
  }

  try {
    console.log(`[Route] Resume received: ${req.file.originalname}`)

    // Agent 1: Parse resume
    const resume = await resumeParserAgent(
      req.file.buffer,
      req.file.originalname
    )

    console.log(`[Route] Resume parsed. Now auto-searching jobs...`)

    // Agent 2: Auto search jobs from resume skills
    const { searchQuery, jobs } = await jobScraperAgentFromResume(resume.id)

    res.json({
      success: true,
      resume: resume,
      autoSearch: {
        query: searchQuery,
        jobsFound: jobs.length,
        jobs: jobs
      }
    })

  } catch (error) {
    console.error('[Route] Error:', error.message)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// GET /api/resume/latest
router.get('/latest', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM resumes ORDER BY created_at DESC LIMIT 1'
    )
    if (result.rows.length === 0) {
      return res.json({ success: false, error: 'No resume found' })
    }
    res.json({ success: true, resume: result.rows[0] })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router