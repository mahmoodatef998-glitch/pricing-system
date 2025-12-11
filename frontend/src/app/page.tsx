import Link from 'next/link'
import { Search, Settings, Package, FileText } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-gray-200/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-blue-600/10 border border-blue-200">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                Professional Product Management
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Pricing System
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Find product prices, specifications, and drawings with our intelligent matching system
            </p>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-16">
              <Link
                href="/match"
                className="group relative p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-indigo-400/0 group-hover:from-blue-400/5 group-hover:to-indigo-400/5 transition-all duration-300"></div>
                
                <div className="relative">
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg">
                      <Search className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Match Product
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Search for products by specifications and get instant pricing information with drawings
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600">
                    <span>Start Matching</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              <Link
                href="/admin/login"
                className="group relative p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-100 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/0 to-purple-400/0 group-hover:from-indigo-400/5 group-hover:to-purple-400/5 transition-all duration-300"></div>
                
                <div className="relative">
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg">
                      <Settings className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Admin Panel
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Manage products, upload drawings, configure pricing, and access full system controls
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-600">
                    <span>Admin Access</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
              <div className="p-6 bg-white/80 backdrop-blur rounded-lg border border-gray-200">
                <Package className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Product Catalog</h3>
                <p className="text-sm text-gray-600">Comprehensive product database with specifications</p>
              </div>
              <div className="p-6 bg-white/80 backdrop-blur rounded-lg border border-gray-200">
                <FileText className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Drawings & Files</h3>
                <p className="text-sm text-gray-600">Access technical drawings and documentation</p>
              </div>
              <div className="p-6 bg-white/80 backdrop-blur rounded-lg border border-gray-200">
                <Search className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Smart Matching</h3>
                <p className="text-sm text-gray-600">Intelligent product matching algorithm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

