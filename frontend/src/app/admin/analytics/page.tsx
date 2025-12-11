'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import { BarChart3, Package, FileText, TrendingUp, Users } from 'lucide-react'

interface AnalyticsData {
  totalProducts: number
  totalDrawings: number
  productsByBrand: Array<{ brand: string; count: number }>
  productsByDescription: Array<{ description: string; count: number }>
  productsByBreakers: Array<{ breakers: string; count: number }>
  recentProducts: number
  averageDrawingsPerProduct: number
  topBrands: Array<{ brand: string; count: number }>
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    loadAnalytics()
  }, [router])

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getAnalytics()
      setAnalytics(data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load analytics')
      if (err.response?.status === 401) {
        router.push('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner text="Loading analytics..." size="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Overview of your products and statistics</p>
          </div>
          <Link
            href="/admin/products"
            className="px-5 py-2.5 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Back to Products
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalProducts}</p>
              </div>
              <Package className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Drawings</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalDrawings}</p>
              </div>
              <FileText className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recent Products</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.recentProducts}</p>
                <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Drawings</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.averageDrawingsPerProduct.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Per product</p>
              </div>
              <BarChart3 className="h-12 w-12 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Brands */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Brands</h2>
            <div className="space-y-3">
              {analytics.topBrands.map((item, index) => (
                <div key={item.brand} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                    <span className="font-semibold text-gray-900">{item.brand}</span>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Products by Description */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Products by Description</h2>
            <div className="space-y-3">
              {analytics.productsByDescription.slice(0, 5).map((item) => (
                <div key={item.description} className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{item.description || 'N/A'}</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Products by Breakers */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Products by Breakers</h2>
            <div className="space-y-3">
              {analytics.productsByBreakers.map((item) => (
                <div key={item.breakers} className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{item.breakers}</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-semibold">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* All Brands */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">All Brands</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {analytics.productsByBrand.map((item) => (
                <div key={item.brand} className="flex items-center justify-between">
                  <span className="text-gray-700">{item.brand}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


