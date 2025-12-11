'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import Link from 'next/link'
import LoadingButton from '@/components/LoadingButton'
import LoadingSpinner from '@/components/LoadingSpinner'

interface MatchResult {
  matched: boolean
  product?: {
    id: number
    description: string
    size: string
    breakers: string
    brand: string
    ipEnclosure?: string | null
    pole?: string | null
    price?: string | null
    drawings: Array<{
      id: number
      filePath: string
      fileType: string
      url: string
    }>
  }
}

export default function MatchPage() {
  const [formData, setFormData] = useState({
    description: '',
    size: '',
    breakers: '',
    brand: '',
    ipEnclosure: '',
    pole: '',
  })
  const [result, setResult] = useState<MatchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const criteria = {
        description: formData.description,
        size: formData.size,
        breakers: formData.breakers,
        brand: formData.brand,
        ipEnclosure: formData.ipEnclosure || undefined,
        pole: formData.pole || undefined,
      }

      const matchResult = await api.matchProduct(criteria)
      setResult(matchResult)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to match product')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newValue = e.target.value
    const fieldName = e.target.name

    // If breakers changed and it's not CONTACTOR, clear size
    if (fieldName === 'breakers' && newValue !== 'CONTACTOR') {
      setFormData({
        ...formData,
        [fieldName]: newValue,
        size: '', // Clear size when switching to manual mode
      })
    } else {
      setFormData({
        ...formData,
        [fieldName]: newValue,
      })
    }
  }

  const getFileUrl = (url: string) => {
    // If URL is already a full URL (Cloudinary), return as is with download parameter
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Add download parameter for Cloudinary URLs to force download
      const separator = url.includes('?') ? '&' : '?'
      return `${url}${separator}fl_attachment`
    }
    // Local file path - prepend API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    return `${apiUrl}${url}`
  }

  if (loading && !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <LoadingSpinner text="Searching for products..." size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">Match Product</h1>
            <p className="text-blue-100">Search for products by specifications</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Grid Layout for Form Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <select
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Description</option>
                  <option value="ATS">ATS</option>
                  <option value="SYNCRO">SYNCRO</option>
                  <option value="TOTALIZATION">TOTALIZATION</option>
                </select>
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-semibold text-gray-700 mb-2">
                  Size {formData.breakers === 'CONTACTOR' ? '(Range)' : ''} <span className="text-red-500">*</span>
                </label>
                {formData.breakers === 'CONTACTOR' ? (
                  <select
                    id="size"
                    name="size"
                    required
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Size Range</option>
                    <option value="32-40">32-40</option>
                    <option value="41-50">41-50</option>
                    <option value="51-65">51-65</option>
                    <option value="66-100">66-100</option>
                    <option value="101-150">101-150</option>
                    <option value="151-225">151-225</option>
                    <option value="226-265">226-265</option>
                    <option value="266-330">266-330</option>
                    <option value="331-400">331-400</option>
                    <option value="401-500">401-500</option>
                    <option value="501-630">501-630</option>
                    <option value="631-800">631-800</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    id="size"
                    name="size"
                    required
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter size manually (e.g., TO, 4000)"
                  />
                )}
              </div>

              <div>
                <label htmlFor="breakers" className="block text-sm font-semibold text-gray-700 mb-2">
                  Breakers <span className="text-red-500">*</span>
                </label>
                <select
                  id="breakers"
                  name="breakers"
                  required
                  value={formData.breakers}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Breakers</option>
                  <option value="CONTACTOR">CONTACTOR</option>
                  <option value="MCCB MOTORIZED">MCCB MOTORIZED</option>
                  <option value="ACB">ACB</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="brand" className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand <span className="text-red-500">*</span>
                </label>
                <select
                  id="brand"
                  name="brand"
                  required
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Brand</option>
                  <option value="LS">LS</option>
                  <option value="EKF">EKF</option>
                  <option value="SHNIDER">SHNIDER</option>
                  <option value="LIGRAND">LIGRAND</option>
                  <option value="ABB">ABB</option>
                  <option value="ETON">ETON</option>
                </select>
              </div>

              <div>
                <label htmlFor="ipEnclosure" className="block text-sm font-semibold text-gray-700 mb-2">
                  IP Enclosure
                </label>
                <select
                  id="ipEnclosure"
                  name="ipEnclosure"
                  value={formData.ipEnclosure}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Select IP Enclosure</option>
                  <option value="54">54</option>
                  <option value="66">66</option>
                </select>
              </div>

              <div>
                <label htmlFor="pole" className="block text-sm font-semibold text-gray-700 mb-2">
                  Pole
                </label>
                <select
                  id="pole"
                  name="pole"
                  value={formData.pole}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Select Pole</option>
                  <option value="3P">3P</option>
                  <option value="4P">4P</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <LoadingButton
                type="submit"
                loading={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
              >
                {loading ? 'Matching...' : 'Match Product'}
              </LoadingButton>
            </div>
          </form>

          {/* Messages */}
          {error && (
            <div className="mx-6 mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="mx-6 mb-6">
              {result.matched && result.product ? (
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-green-700">
                      Match Found!
                    </h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Description</p>
                      <p className="font-semibold text-gray-900">{result.product.description || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Size</p>
                      <p className="font-semibold text-gray-900">{result.product.size}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Breakers</p>
                      <p className="font-semibold text-gray-900">{result.product.breakers}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Brand</p>
                      <p className="font-semibold text-gray-900">{result.product.brand}</p>
                    </div>
                    {result.product.ipEnclosure && (
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">IP Enclosure</p>
                        <p className="font-semibold text-gray-900">{result.product.ipEnclosure}</p>
                      </div>
                    )}
                    {result.product.pole && (
                      <div className="bg-white p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Pole</p>
                        <p className="font-semibold text-gray-900">{result.product.pole}</p>
                      </div>
                    )}
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Price</p>
                      <p className="font-semibold text-gray-900">{result.product.price || 'Not set'}</p>
                    </div>
                  </div>

                  {result.product.drawings.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Drawings:</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {result.product.drawings.map((drawing) => (
                          <a
                            key={drawing.id}
                            href={getFileUrl(drawing.url)}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {drawing.fileType.toUpperCase()}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-gradient-to-br from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg shadow-md">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-red-700 mb-2">
                        No Match Found
                      </h2>
                      <p className="text-gray-600">
                        No product found matching the specified criteria.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

