const BASE_URL = import.meta.env.VITE_BACKEND_URL

export const jobsAPI = {

  searchJobs: async (query) => {
    const response = await fetch(`${BASE_URL}/api/jobs/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Search failed')
    }
    return response.json()
  },

  getAllJobs: async () => {
    const response = await fetch(`${BASE_URL}/api/jobs/all`)
    if (!response.ok) {
      throw new Error('Failed to load jobs')
    }
    return response.json()
  }

}

export const resumeAPI = {

  uploadResume: async (file) => {
    const formData = new FormData()
    formData.append('resume', file)
    const response = await fetch(`${BASE_URL}/api/resume/upload`, {
      method: 'POST',
      body: formData
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }
    return response.json()
  },

  getLatestResume: async () => {
    const response = await fetch(`${BASE_URL}/api/resume/latest`)
    if (!response.ok) {
      throw new Error('Failed to load resume')
    }
    return response.json()
  }

}

export const rewriterAPI = {

  rewriteResume: async (jobId, resumeId) => {
    const response = await fetch(`${BASE_URL}/api/rewriter/rewrite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jobId, resumeId })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Rewrite failed')
    }
    return response.json()
  }

}

export const trackerAPI = {

  applyToJob: async (jobId) => {
    const response = await fetch(`${BASE_URL}/api/tracker/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Apply failed')
    }
    return response.json()
  },

  getAllApplications: async () => {
    const response = await fetch(`${BASE_URL}/api/tracker/all`)
    if (!response.ok) throw new Error('Failed to load applications')
    return response.json()
  },

  updateStatus: async (applicationId, status) => {
    const response = await fetch(`${BASE_URL}/api/tracker/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId, status })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Update failed')
    }
    return response.json()
  },

  deleteApplication: async (applicationId) => {
    const response = await fetch(`${BASE_URL}/api/tracker/delete/${applicationId}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Delete failed')
    return response.json()
  }

}