'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function PaymentFailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const errorCode = searchParams.get('code')
  const errorMessage = searchParams.get('message')

  const getErrorMessage = () => {
    if (errorCode === 'USER_CANCEL') {
      return '결제가 취소되었습니다.'
    }
    if (errorCode === 'PAY_PROCESS_CANCELED') {
      return '결제 처리가 취소되었습니다.'
    }
    return errorMessage || '결제 처리 중 오류가 발생했습니다.'
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleRetry = () => {
    // Clear any stored payment info
    sessionStorage.removeItem('paymentInfo')
    sessionStorage.removeItem('pendingPdfFile')
    sessionStorage.removeItem('pendingPdfFileName')
    router.push('/')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">결제 실패</h1>
            <p className="text-gray-600 mt-2">{getErrorMessage()}</p>
          </div>

          {/* Error Details */}
          {errorCode && (
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-500">
                <span className="font-semibold">오류 코드:</span> {errorCode}
              </p>
            </div>
          )}

          {/* Help Text */}
          <div className="text-sm text-gray-500">
            <p>문제가 지속되면 다시 시도하거나</p>
            <p>다른 결제 수단을 사용해보세요.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleGoHome}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              메인으로
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function PaymentFail() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </main>
    }>
      <PaymentFailContent />
    </Suspense>
  )
}
