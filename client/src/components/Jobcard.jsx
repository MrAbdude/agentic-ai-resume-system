import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { rewriterAPI, trackerAPI } from '../lib/api'



export default function JobCard({ job, resumeId }) {
  const [showRewrite, setShowRewrite] = useState(false)
  const [applied, setApplied] = useState(false)
  const score = job.match_score || 0

  const scoreColor = score >= 70
    ? 'text-emerald-400 border-emerald-800 bg-emerald-950'
    : score >= 40
    ? 'text-yellow-400 border-yellow-800 bg-yellow-950'
    : 'text-zinc-400 border-zinc-700 bg-zinc-900'

  const rewriteMutation = useMutation({
    mutationFn: () => rewriterAPI.rewriteResume(job.id, resumeId),
    onSuccess: () => setShowRewrite(true)
  })

  const applyMutation = useMutation({
  mutationFn: () => trackerAPI.applyToJob(job.id),
  onSuccess: () => setApplied(true)
})

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-all">

      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="font-semibold text-white text-base leading-tight">
            {job.title}
          </h3>
          <p className="text-zinc-400 text-sm mt-1">
            {job.company}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 px-2.5 py-1 rounded-full whitespace-nowrap">
            {job.employment_type}
          </span>
          {score > 0 && (
            <span className={`text-xs border px-2.5 py-1 rounded-full whitespace-nowrap font-semibold ${scoreColor}`}>
              {score}% match
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-3">
        <span>📍</span>
        <span>{job.location}</span>
      </div>

      {job.description && (
        <p className="text-zinc-500 text-xs leading-relaxed mb-4 line-clamp-3">
          {job.description}
        </p>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        {job.apply_link ? (
          <a
            href={job.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Apply Now →
          </a>
        ) : (
          <span className="text-xs text-zinc-600">No apply link available</span>
        )}

        {resumeId && (
          <button
            onClick={() => rewriteMutation.mutate()}
            disabled={rewriteMutation.isPending}
            className="inline-block border border-zinc-700 hover:border-emerald-600 text-zinc-400 hover:text-emerald-400 text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {rewriteMutation.isPending ? 'Rewriting...' : '✨ Rewrite for this job'}
          </button>
        )}

        <button
          onClick={() => applyMutation.mutate()}
          disabled={applyMutation.isPending || applied}
          className={`inline-block text-xs font-semibold px-4 py-2 rounded-lg transition-colors
            ${applied
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              : 'border border-zinc-700 hover:border-blue-600 text-zinc-400 hover:text-blue-400'
            }`}
        >
          {applied ? '✅ Applied' : applyMutation.isPending ? 'Saving...' : '📌 Mark as Applied'}
        </button>
      </div>

      {/* Rewritten Resume Section */}
      {showRewrite && rewriteMutation.isSuccess && (
        <div className="mt-4 border-t border-zinc-800 pt-4 space-y-4">

          <div className="font-mono text-xs text-emerald-400">
            ✅ Agent 4: Resume rewritten for {job.title} at {job.company}
          </div>

          {/* Rewritten Bullets */}
          <div>
            <h4 className="text-white text-xs font-semibold mb-2">
              Rewritten Resume Bullets
            </h4>
            <ul className="space-y-2">
              {rewriteMutation.data.result.rewritten_bullets.map((bullet, i) => (
                <li key={i} className="text-zinc-400 text-xs flex gap-2">
                  <span className="text-emerald-400 flex-shrink-0">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Keywords Added */}
          <div>
            <h4 className="text-white text-xs font-semibold mb-2">
              Keywords Added
            </h4>
            <div className="flex flex-wrap gap-2">
              {rewriteMutation.data.result.keywords_added.map((keyword, i) => (
                <span
                  key={i}
                  className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs px-2.5 py-1 rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="bg-zinc-800 rounded-lg px-4 py-3">
            <h4 className="text-white text-xs font-semibold mb-1">
              💡 Tip
            </h4>
            <p className="text-zinc-400 text-xs">
              {rewriteMutation.data.result.tip}
            </p>
          </div>

          <button
            onClick={() => setShowRewrite(false)}
            className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
          >
            Hide
          </button>

        </div>
      )}

    </div>
  )
}