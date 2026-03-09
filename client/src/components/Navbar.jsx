import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const links = [
  { path: '/', label: 'Job Search' },
  { path: '/upload', label: 'Resume Parser' },
  { path: '/tracker', label: 'Tracker' },
]

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 px-6 py-4">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <span className="font-bold text-white text-sm">
          Resume<span className="text-emerald-400">Agent</span>
        </span>
        <div className="flex gap-6">
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm transition-colors ${
                location.pathname === link.path
                  ? 'text-emerald-400 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}