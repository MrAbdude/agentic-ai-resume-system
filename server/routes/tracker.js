const express = require('express')
const router = express.Router()
const { trackerAgent } = require('../agents/trackerAgent')

// POST /api/tracker/apply
router.post('/apply', async (req, res) => {
  const { jobId } = req.body

  if (!jobId) {
    return res.status(400).json({
      success: false,
      error: 'Please provide jobId'
    })
  }

  try {
    const application = await trackerAgent('apply', { jobId })
    res.json({ success: true, application })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/tracker/all
router.get('/all', async (req, res) => {
  try {
    const applications = await trackerAgent('getAll', {})
    res.json({ success: true, applications })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// PATCH /api/tracker/status
router.patch('/status', async (req, res) => {
  const { applicationId, status } = req.body

  if (!applicationId || !status) {
    return res.status(400).json({
      success: false,
      error: 'Please provide applicationId and status'
    })
  }

  try {
    const application = await trackerAgent('updateStatus', { applicationId, status })
    res.json({ success: true, application })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// DELETE /api/tracker/delete
router.delete('/delete/:id', async (req, res) => {
  const applicationId = req.params.id

  try {
    await trackerAgent('delete', { applicationId })
    res.json({ success: true, message: 'Application removed' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

module.exports = router