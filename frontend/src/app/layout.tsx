import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import Toast from '@/components/Toast'

export const metadata: Metadata = {
  title: 'Pricing System - Product Management',
  description: 'Professional product pricing and matching system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <ErrorBoundary>
          <Header />
          {children}
          <Toast />
        </ErrorBoundary>
      </body>
    </html>
  )
}

