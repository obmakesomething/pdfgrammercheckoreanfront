'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      const orderId = searchParams.get('orderId')
      const paymentKey = searchParams.get('paymentKey')
      const amount = searchParams.get('amount')

      if (!orderId || !paymentKey || !amount) {
        setError('결제 정보가 올바르지 않습니다.')
        setIsVerifying(false)
        return
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.pdfgrammercheckorean.site'
        const response = await fetch(`${apiUrl}/api/payment/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            paymentKey,
            amount: parseInt(amount),
          }),
        })

        const data = await response.json()

        if (response.ok && data.status === 'success') {
          setIsSuccess(true)
          setPaymentInfo(data.payment)
          // 프리미엄 상태를 로컬 스토리지에 저장
          localStorage.setItem('premiumExpiry', data.expiryDate)
          localStorage.setItem('premiumOrderId', orderId)
        } else {
          setError(data.message || '결제 확인에 실패했습니다.')
        }
      } catch (err) {
        console.error('결제 확인 오류:', err)
        setError('결제 확인 중 오류가 발생했습니다.')
      } finally {
        setIsVerifying(false)
      }
    }

    verifyPayment()
  }, [searchParams])

  if (isVerifying) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h1 className="text-xl font-semibold text-gray-900">결제 확인 중...</h1>
          <p className="text-gray-600 mt-2">잠시만 기다려주세요.</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 확인 실패</h1>
          <p className="text-gray-600 mb-6">{error}</p>
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
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 완료!</h1>
        <p className="text-gray-600 mb-6">프리미엄 멤버십이 활성화되었습니다.</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">주문번호</span>
              <span className="font-medium text-gray-900">{searchParams.get('orderId')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">결제금액</span>
              <span className="font-medium text-gray-900">{parseInt(searchParams.get('amount') || '0').toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">멤버십</span>
              <span className="font-medium text-green-600">프리미엄 (30일)</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">프리미엄 혜택</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>- 광고 없이 바로 맞춤법 검사</li>
            <li>- 무제한 PDF 검사</li>
            <li>- 빠른 처리 속도</li>
          </ul>
        </div>

        <Link
          href="/"
          className="block w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          맞춤법 검사 시작하기
        </Link>
      </div>
    </main>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h1 className="text-xl font-semibold text-gray-900">로딩 중...</h1>
        </div>
      </main>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
