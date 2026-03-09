const db = require('../db')

async function trackerAgent(action, data) {
  console.log(`[Tracker Agent] Action: ${action}`)

  // Add new application
  if (action === 'apply') {
    const { jobId } = data

    // Get job details from database
    const jobResult = await db.query(
      'SELECT * FROM jobs WHERE id = $1',
      [jobId]
    )

    if (jobResult.rows.length === 0) {
      throw new Error('Job not found')
    }

    const job = jobResult.rows[0]

    // Check if already applied
    const existing = await db.query(
      'SELECT * FROM applications WHERE job_id = $1',
      [jobId]
    )

    if (existing.rows.length > 0) {
      throw new Error('Already applied to this job')
    }

    // Save application
    const result = await db.query(
      `INSERT INTO applications (job_id, job_title, company, apply_link, status)
       VALUES ($1, $2, $3, $4, 'Applied')
       RETURNING *`,
      [jobId, job.title, job.company, job.apply_link]
    )

    console.log(`[Tracker Agent] Applied to ${job.title} at ${job.company} ✅`)
    return result.rows[0]
  }

  // Get all applications
  if (action === 'getAll') {
    const result = await db.query(
      'SELECT * FROM applications ORDER BY applied_at DESC'
    )
    console.log(`[Tracker Agent] Found ${result.rows.length} applications`)
    return result.rows
  }

  // Update application status
  if (action === 'updateStatus') {
    const { applicationId, status } = data

    const result = await db.query(
      `UPDATE applications 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, applicationId]
    )

    if (result.rows.length === 0) {
      throw new Error('Application not found')
    }

    console.log(`[Tracker Agent] Status updated to ${status} ✅`)
    return result.rows[0]
  }

  // Delete application
  if (action === 'delete') {
    const { applicationId } = data

    await db.query(
      'DELETE FROM applications WHERE id = $1',
      [applicationId]
    )

    console.log(`[Tracker Agent] Application deleted ✅`)
    return { deleted: true }
  }

  throw new Error('Unknown action: ' + action)
}

module.exports = { trackerAgent }