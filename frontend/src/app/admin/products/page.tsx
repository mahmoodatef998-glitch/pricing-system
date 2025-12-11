'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import toast from 'react-hot-toast'

interface Product {
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
  }>
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchBrand, setSearchBrand] = useState('')
  const [searchDescription, setSearchDescription] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    loadProducts()
  }, [router, page, searchBrand, searchDescription])

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.getProducts({
        page,
        limit: 10,
        brand: searchBrand || undefined,
        description: searchDescription || undefined,
      })
      setProducts(result.products)
      setTotalPages(result.pagination.totalPages)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load products')
      if (err.response?.status === 401) {
        router.push('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    const deleteToast = toast.loading('جاري الحذف...')
    try {
      await api.deleteProduct(id)
      toast.success('✅ تم حذف المنتج بنجاح!', { id: deleteToast })
      loadProducts()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'فشل حذف المنتج', { id: deleteToast })
    }
  }

  const handleLogout = () => {
    api.clearAuthToken()
    router.push('/admin/login')
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map(p => p.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectProduct = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('يرجى اختيار منتج واحد على الأقل')
      return
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} product(s)?`)) {
      return
    }

    setBulkLoading(true)
    const deleteToast = toast.loading(`جاري حذف ${selectedIds.length} منتج(ات)...`)
    try {
      await api.bulkDelete(selectedIds)
      toast.success(`✅ تم حذف ${selectedIds.length} منتج(ات) بنجاح!`, { id: deleteToast })
      setSelectedIds([])
      loadProducts()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'فشل حذف المنتجات', { id: deleteToast })
    } finally {
      setBulkLoading(false)
    }
  }

  const handleExportExcel = async () => {
    const exportToast = toast.loading('جاري التصدير...')
    try {
      await api.exportToExcel({
        brand: searchBrand || undefined,
        description: searchDescription || undefined,
      })
      toast.success('✅ تم تصدير Excel بنجاح!', { id: exportToast })
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'فشل التصدير', { id: exportToast })
    }
  }

  const handleExportPDF = async () => {
    const exportToast = toast.loading('جاري التصدير...')
    try {
      await api.exportToPDF({
        brand: searchBrand || undefined,
        description: searchDescription || undefined,
      })
      toast.success('✅ تم تصدير PDF بنجاح!', { id: exportToast })
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'فشل التصدير', { id: exportToast })
    }
  }

  const handleExportSelectedExcel = async () => {
    if (selectedIds.length === 0) {
      toast.error('يرجى اختيار منتج واحد على الأقل')
      return
    }
    const exportToast = toast.loading(`جاري تصدير ${selectedIds.length} منتج(ات)...`)
    try {
      await api.exportSelectedExcel(selectedIds)
      toast.success(`✅ تم تصدير ${selectedIds.length} منتج(ات) إلى Excel!`, { id: exportToast })
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'فشل التصدير', { id: exportToast })
    }
  }

  const handleExportSelectedPDF = async () => {
    if (selectedIds.length === 0) {
      toast.error('يرجى اختيار منتج واحد على الأقل')
      return
    }
    const exportToast = toast.loading(`جاري تصدير ${selectedIds.length} منتج(ات)...`)
    try {
      await api.exportSelectedPDF(selectedIds)
      toast.success(`✅ تم تصدير ${selectedIds.length} منتج(ات) إلى PDF!`, { id: exportToast })
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'فشل التصدير', { id: exportToast })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Products Dashboard</h1>
            <p className="text-gray-600">Manage and view all products</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/form"
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Product
            </Link>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </Link>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 shadow-md hover:shadow-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">All Products</h2>
              <div className="flex flex-wrap gap-2">
                {selectedIds.length > 0 && (
                  <>
                    <button
                      onClick={handleExportSelectedExcel}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export Selected Excel ({selectedIds.length})
                    </button>
                    <button
                      onClick={handleExportSelectedPDF}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export Selected PDF ({selectedIds.length})
                    </button>
                  </>
                )}
                <button
                  onClick={handleExportExcel}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export All Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export All PDF
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-blue-900">
                  {selectedIds.length} product(s) selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {bulkLoading ? 'Deleting...' : `Delete ${selectedIds.length} Product(s)`}
                </button>
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by brand..."
                  value={searchBrand}
                  onChange={(e) => {
                    setSearchBrand(e.target.value)
                    setPage(1)
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by description..."
                  value={searchDescription}
                  onChange={(e) => {
                    setSearchDescription(e.target.value)
                    setPage(1)
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {loading ? (
              <LoadingSpinner text="Loading products..." size="lg" />
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No products found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select All */}
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === products.length && products.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-semibold text-gray-700">
                    Select All ({selectedIds.length} selected)
                  </label>
                </div>

                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-1"
                        />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {product.description} - {product.size}
                          </h3>
                        <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <p><span className="font-semibold">Brand:</span> {product.brand}</p>
                          <p><span className="font-semibold">Breakers:</span> {product.breakers}</p>
                          {product.ipEnclosure && (
                            <p><span className="font-semibold">IP Enclosure:</span> {product.ipEnclosure}</p>
                          )}
                          {product.pole && (
                            <p><span className="font-semibold">Pole:</span> {product.pole}</p>
                          )}
                          {product.price && (
                            <p><span className="font-semibold">Price:</span> {product.price}</p>
                          )}
                        </div>
                        {product.drawings.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Drawings:</p>
                            <div className="flex flex-wrap gap-2">
                              {product.drawings.map((drawing) => (
                                <a
                                  key={drawing.id}
                                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/${product.id}/${drawing.filePath.split('/').pop()}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                                >
                                  {drawing.fileType.toUpperCase()}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        </div>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <Link
                          href={`/form?edit=${product.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
