// Simple global store to persist resume data across pages
let resumeStore = null

export const setResumeData = (data) => {
  resumeStore = data
}

export const getResumeData = () => {
  return resumeStore
}