import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { trackerAPI } from '../lib/api'

const STATUS_OPTIONS = ['Applied', 'Interview', 'Rejected', 'Offer']

const statusColor = (status) => {
  if (status === 'Applied') return 'text-blue-400 bg-blue-950 border-blue-800'
  if (status === 'Interview') return 'text-yellow-400 bg-yellow-950 border-yellow-800'
  if (status === 'Rejected') return 'text-red-400 bg-red-950 border-red-800'
  if (status === 'Offer') return 'text-emerald-400 bg-emerald-950 border-emerald-800'
  return 'text-zinc-400 bg-zinc-900 border-zinc-700'
}

export default function Tracker() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: trackerAPI.getAllApplications
  })

  const updateMutation = useMutation({
    mutationFn: ({ applicationId, status }) =>
      trackerAPI.updateStatus(applicationId, status),
    onSuccess: () => queryClient.invalidateQueries(['applications'])
  })

  const deleteMutation = useMutation({
    mutationFn: (applicationId) => trackerAPI.deleteApplication(applicationId),
    onSuccess: () => queryClient.invalidateQueries(['applications'])
  })

  const applications = data?.applications || []

  const counts = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'Applied').length,
    interview: applications.filter(a => a.status === 'Interview').length,
    offer: applications.filter(a => a.status === 'Offer').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">
            Application<span className="text-emerald-400">Tracker</span>
          </h1>
          <p className="text-zinc-400 text-sm">
            Track all your job applications in one place.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total', value: counts.total, color: 'text-white' },
            { label: 'Interview', value: counts.interview, color: 'text-yellow-400' },
            { label: 'Offer', value: counts.offer, color: 'text-emerald-400' },
            { label: 'Rejected', value: counts.rejected, color: 'text-red-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-zinc-500 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-zinc-800 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && applications.length === 0 && (
          <div className="text-center py-20 text-zinc-600">
            <div className="text-4xl mb-4">📌</div>
            <p>No applications yet</p>
            <p className="text-xs mt-2">Click Mark as Applied on any job card to track it here</p>
          </div>
        )}

        {/* Applications List */}
        {!isLoading && applications.length > 0 && (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      {app.job_title}
                    </h3>
                    <p className="text-zinc-400 text-xs mt-1">
                      {app.company}
                    </p>
                    <p className="text-zinc-600 text-xs mt-1">
                      Applied {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span className={`text-xs border px-2.5 py-1 rounded-full whitespace-nowrap font-semibold ${statusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() => updateMutation.mutate({
                        applicationId: app.id,
                        status
                      })}
                      disabled={app.status === status || updateMutation.isPending}
                      className={`text-xs px-3 py-1 rounded-lg border transition-colors
                        ${app.status === status
                          ? 'border-zinc-700 text-zinc-600 cursor-not-allowed'
                          : 'border-zinc-700 text-zinc-400 hover:border-emerald-600 hover:text-emerald-400'
                        }`}
                    >
                      {status}
                    </button>
                  ))}

                  <button
                    onClick={() => deleteMutation.mutate(app.id)}
                    disabled={deleteMutation.isPending}
                    className="text-xs px-3 py-1 rounded-lg border border-zinc-700 text-zinc-600 hover:border-red-800 hover:text-red-400 transition-colors ml-auto"
                  >
                    Remove
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}