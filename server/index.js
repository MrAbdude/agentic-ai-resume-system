require('dotenv').config()
const express = require('express')
const cors = require('cors')
require('./db')
const jobsRouter = require('./routes/jobs')
const resumeRouter = require('./routes/resume')
const rewriterRouter = require('./routes/rewriter')
const trackerRouter = require('./routes/tracker')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://agentic-ai-resume-system.netlify.app'
  ]
}))
app.use(express.json())

app.use('/api/jobs', jobsRouter)
app.use('/api/resume', resumeRouter)
app.use('/api/rewriter', rewriterRouter)
app.use('/api/tracker', trackerRouter)

app.get('/', (req, res) => {
  res.json({
    status: 'ResumeAgent backend is running',
    message: 'All 5 agents ready'
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
