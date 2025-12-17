'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function PaymentFailContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('code')
  const errorMessage = searchParams.get('message')

  const getErrorDescription = (code: string | null) => {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '결제가 취소되었습니다.'
      case 'PAY_PROCESS_ABORTED':
        return '결제 진행 중 문제가 발생했습니다.'
      case 'REJECT_CARD_COMPANY':
        return '카드사에서 결제가 거부되었습니다.'
      case 'INVALID_CARD_LOST_OR_STOLEN':
        return '분실 또는 도난 카드입니다.'
      case 'EXCEED_MAX_AMOUNT':
        return '결제 한도를 초과했습니다.'
      default:
        return errorMessage || '결제 처리 중 오류가 발생했습니다.'
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
        <p className="text-gray-600 mb-6">{getErrorDescription(errorCode)}</p>

        {errorCode && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm">
            <span className="text-gray-500">오류 코드: </span>
            <span className="font-mono text-gray-700">{errorCode}</span>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/payment"
            className="block w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            다시 시도하기
          </Link>
          <Link
            href="/"
            className="block w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            메인으로 돌아가기
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t text-sm text-gray-500">
          <p>문제가 계속되면 고객센터로 문의해주세요.</p>
          <p className="mt-1">support@pdfgrammercheckorean.site</p>
        </div>
      </div>
    </main>
  )
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h1 className="text-xl font-semibold text-gray-900">로딩 중...</h1>
        </div>
      </main>
    }>
      <PaymentFailContent />
    </Suspense>
  )
}
