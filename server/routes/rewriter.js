const express = require('express')
const router = express.Router()
const { rewriterAgent } = require('../agents/rewriterAgent')

// POST /api/rewriter/rewrite
router.post('/rewrite', async (req, res) => {
  const { jobId, resumeId } = req.body

  if (!jobId || !resumeId) {
    return res.status(400).json({
      success: false,
      error: 'Please provide jobId and resumeId'
    })
  }

  try {
    console.log(`[Route] Rewrite request — job ${jobId}, resume ${resumeId}`)
    const result = await rewriterAgent(jobId, resumeId)

    res.json({
      success: true,
      result: result
    })

  } catch (error) {
    console.error('[Route] Rewriter error:', error.message)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

module.exports = router