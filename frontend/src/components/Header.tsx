'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()

  // Don't show header on login page
  if (pathname === '/admin/login') {
    return null
  }

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-105">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">Pricing System</span>
                <span className="text-xs text-gray-500 font-medium">Product Management</span>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                pathname === '/'
                  ? 'text-blue-600 bg-blue-50 shadow-sm'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            <Link
              href="/match"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                pathname === '/match'
                  ? 'text-blue-600 bg-blue-50 shadow-sm'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Match Product
            </Link>
            <Link
              href="/admin/login"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                pathname?.startsWith('/admin')
                  ? 'text-blue-600 bg-blue-50 shadow-sm'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Admin
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-700 hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

