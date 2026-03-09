import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { resumeAPI } from '../lib/api'
import { setResumeData } from '../lib/store'

export default function Upload() {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const navigate = useNavigate()

  const uploadMutation = useMutation({
    mutationFn: resumeAPI.uploadResume,
    onSuccess: (data) => {
      setResumeData({
        jobs: data.autoSearch.jobs,
        skills: data.resume.skills,
        searchQuery: data.autoSearch.query,
        resumeId: data.resume.id
      })
      navigate('/')
    }
  })

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
      uploadMutation.reset()
    } else {
      alert('Please select a PDF file only')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleUpload = () => {
    if (!selectedFile) return
    uploadMutation.mutate(selectedFile)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-16">

        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Resume<span className="text-emerald-400">Parser</span> Agent
          </h1>
          <p className="text-zinc-400 text-sm">
            Upload your resume. AI extracts your skills and finds matching jobs automatically.
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => document.getElementById('fileInput').click()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all mb-6
            ${dragOver
              ? 'border-emerald-400 bg-emerald-400/10'
              : 'border-zinc-700 hover:border-emerald-600 hover:bg-zinc-900'
            }
            ${uploadMutation.isPending ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input
            id="fileInput"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
          <div className="text-4xl mb-4">
            {selectedFile ? '📄' : '⬆️'}
          </div>
          <p className="font-semibold text-white">
            {selectedFile ? selectedFile.name : 'Drag & drop your resume PDF'}
          </p>
          <p className="text-zinc-500 text-xs mt-1">
            {selectedFile ? 'File selected — click Upload below' : 'or click to browse'}
          </p>
        </div>

        {selectedFile && (
          <button
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-xl text-sm transition-colors mb-6"
          >
            {uploadMutation.isPending ? 'Agents running...' : 'Upload & Find Matching Jobs'}
          </button>
        )}

        {uploadMutation.isPending && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 mb-6 font-mono text-xs space-y-2">
            <div className="text-emerald-400">
              <span className="animate-pulse">▊</span> Agent 1: Reading PDF → extracting skills with Groq AI...
            </div>
            <div className="text-zinc-500">
              Agent 2: Will search jobs from your skills automatically...
            </div>
          </div>
        )}

        {uploadMutation.isError && (
          <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
            Error: {uploadMutation.error.message}
          </div>
        )}

      </div>
    </div>
  )
}