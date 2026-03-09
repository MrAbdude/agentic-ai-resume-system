import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getResumeData } from '../lib/store'
import { jobsAPI } from '../lib/api'
import JobCard from '../components/Jobcard'

export default function Home() {
  const [searchInput, setSearchInput] = useState('')
  const queryClient = useQueryClient()
  const resumeData = getResumeData()

  const { data: existingData, isLoading: loadingExisting } = useQuery({
    queryKey: ['allJobs'],
    queryFn: jobsAPI.getAllJobs,
    enabled: !resumeData
  })

  const searchMutation = useMutation({
    mutationFn: jobsAPI.searchJobs,
    onSuccess: () => {
      queryClient.invalidateQueries(['allJobs'])
    }
  })

  const handleSearch = () => {
    if (!searchInput.trim()) return
    searchMutation.mutate(searchInput)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const jobsToShow = searchMutation.data?.jobs
    || resumeData?.jobs
    || existingData?.jobs
    || []

  const isLoading = searchMutation.isPending || loadingExisting

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Job<span className="text-emerald-400">Search</span> Agent
          </h1>
          <p className="text-zinc-400 text-sm">
            Searches live job listings and saves them to your database automatically.
          </p>
        </div>

        {/* Resume upload banner */}
        {resumeData && !searchMutation.data && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 font-mono text-xs space-y-2">
            <div className="text-emerald-400">
              ✅ Agent 1: Resume parsed — skills extracted
            </div>
            <div className="text-emerald-400">
              ✅ Agent 2: Jobs searched automatically
            </div>
            <div className="text-zinc-500">
              Auto search query: "{resumeData.searchQuery}"
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {resumeData.skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs px-2 py-0.5 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="React Developer, Python Engineer..."
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-emerald-500 transition-colors"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !searchInput.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:cursor-not-allowed text-black font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            {searchMutation.isPending ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchMutation.isPending && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 mb-6 font-mono text-xs text-emerald-400">
            <span className="animate-pulse">▊</span>
            {' '}Agent running... calling JSearch API → saving to PostgreSQL...
          </div>
        )}

        {searchMutation.isError && (
          <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
            Error: {searchMutation.error.message}
          </div>
        )}

        {searchMutation.isSuccess && (
          <div className="text-zinc-500 text-xs mb-4">
            Agent found {searchMutation.data.count} jobs for "{searchInput}"
          </div>
        )}

        {loadingExisting && !searchMutation.isPending && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-zinc-800 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && jobsToShow.length > 0 && (
          <div className="space-y-3">
            {jobsToShow.map((job) => (
              <JobCard key={job.id} job={job} resumeId={resumeData?.resumeId} />
            ))}
          </div>
        )}

        {!isLoading && jobsToShow.length === 0 && (
          <div className="text-center py-20 text-zinc-600">
            <div className="text-4xl mb-4">🔍</div>
            <p>Search for a job title above to get started</p>
          </div>
        )}

      </div>
    </div>
  )
}