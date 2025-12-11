'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import Link from 'next/link'
import LoadingButton from '@/components/LoadingButton'
import LoadingSpinner from '@/components/LoadingSpinner'
import ImagePreview from '@/components/ImagePreview'
import FilePreview from '@/components/FilePreview'
import toast from 'react-hot-toast'

export default function FormPage() {
  const router = useRouter()
  const [editId, setEditId] = useState<string | null>(null)
  const isEditMode = !!editId

  useEffect(() => {
    // Get edit ID from URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('edit')
      setEditId(id)
    }
  }, [])

  const [formData, setFormData] = useState({
    description: '',
    size: '',
    breakers: '',
    brand: '',
    ipEnclosure: '',
    pole: '',
    price: '',
  })
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [duplicates, setDuplicates] = useState<any[]>([])

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    // Load product data if in edit mode
    if (isEditMode && editId) {
      loadProduct(parseInt(editId))
    }
  }, [router, editId, isEditMode])

  const loadProduct = async (id: number) => {
    setLoadingProduct(true)
    try {
      const product = await api.getProduct(id)
      setFormData({
        description: product.description || '',
        size: product.size || '',
        breakers: product.breakers || '',
        brand: product.brand || '',
        ipEnclosure: product.ipEnclosure || '',
        pole: product.pole || '',
        price: product.price || '',
      })
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to load product'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoadingProduct(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (isEditMode && editId) {
        // Update existing product
        await api.updateProduct(
          parseInt(editId),
          {
            description: formData.description,
            size: formData.size,
            breakers: formData.breakers,
            brand: formData.brand,
            ipEnclosure: formData.ipEnclosure || undefined,
            pole: formData.pole || undefined,
            price: formData.price || undefined,
          },
          files.length > 0 ? files : undefined
        )
        setSuccess(true)
        toast.success('✅ تم تحديث المنتج بنجاح!')
        // Redirect to products page after 2 seconds
        setTimeout(() => {
          router.push('/admin/products')
        }, 2000)
      } else {
        // Create new product
        await api.createProduct(
          {
            description: formData.description,
            size: formData.size,
            breakers: formData.breakers,
            brand: formData.brand,
            ipEnclosure: formData.ipEnclosure || undefined,
            pole: formData.pole || undefined,
            price: formData.price || undefined,
          },
          files.length > 0 ? files : undefined
        )
        setSuccess(true)
        // Reset form
        setFormData({
          description: '',
          size: '',
          breakers: '',
          brand: '',
          ipEnclosure: '',
          pole: '',
          price: '',
        })
        setFiles([])
        toast.success('✅ تم إنشاء المنتج بنجاح!')
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || (isEditMode ? 'Failed to update product' : 'Failed to create product')
      setError(errorMessage)
      
      // Handle duplicate product error
      if (err.response?.data?.code === 'DUPLICATE_PRODUCT') {
        toast.error('⚠️ منتج مطابق موجود بالفعل!', {
          duration: 5000,
        })
        setDuplicates(err.response?.data?.duplicates || [])
      } else {
        toast.error(errorMessage)
      }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    toast.success('تم حذف الملف')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/admin/products" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isEditMode ? 'Edit Product' : 'Create New Product'}
            </h1>
            <p className="text-blue-100">
              {isEditMode ? 'Update the product details below' : 'Fill in the product details below'}
            </p>
          </div>

          {loadingProduct ? (
            <div className="p-12">
              <LoadingSpinner text="Loading product data..." size="lg" />
            </div>
          ) : (
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

            <div>
              <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                Price
              </label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="e.g., MANUAL or 1000"
              />
            </div>

            <div>
              <label htmlFor="files" className="block text-sm font-semibold text-gray-700 mb-2">
                Drawings <span className="text-gray-500 font-normal">(PDF, JPG, PNG, DWG)</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="files"
                  name="files"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.dwg"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-blue-400"
                />
                {files.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      ✓ {files.length} ملف محدد
                    </p>
                    <ImagePreview files={files} onRemove={handleRemoveFile} />
                    <FilePreview files={files.filter(f => !f.type.startsWith('image/'))} onRemove={handleRemoveFile} />
                  </div>
                )}
              </div>
            </div>

            {/* Duplicate Warning */}
            {duplicates.length > 0 && (
              <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-800 mb-2">
                      ⚠️ منتج مطابق موجود بالفعل!
                    </p>
                    <p className="text-sm text-yellow-700 mb-2">
                      تم العثور على {duplicates.length} منتج(ات) بنفس المواصفات:
                    </p>
                    <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                      {duplicates.slice(0, 3).map((dup: any) => (
                        <li key={dup.id}>
                          ID: {dup.id} - {dup.description} - {dup.brand}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <LoadingButton
                type="submit"
                loading={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (isEditMode ? 'Updating Product...' : 'Creating Product...') : (isEditMode ? 'Update Product' : 'Create Product')}
              </LoadingButton>
            </div>
          </form>
          )}

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

          {success && (
            <div className="mx-6 mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-green-800 font-medium">
                  {isEditMode ? 'Product updated successfully!' : 'Product created successfully!'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

