'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Script from 'next/script'
import Link from 'next/link'

declare global {
  interface Window {
    TossPayments: any
  }
}

export default function PaymentPage() {
  const searchParams = useSearchParams()
  const widgetRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 결제 정보
  const amount = 3900
  const orderName = '프리미엄 멤버십 (30일)'

  // 클라이언트 키 (테스트용)
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'
  const customerKey = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  useEffect(() => {
    if (typeof window !== 'undefined' && window.TossPayments && !widgetRef.current) {
      initializeWidget()
    }
  }, [isReady])

  const initializeWidget = async () => {
    try {
      const tossPayments = window.TossPayments(clientKey)
      const widgets = tossPayments.widgets({ customerKey })
      widgetRef.current = widgets

      await widgets.setAmount({
        currency: 'KRW',
        value: amount,
      })

      await Promise.all([
        widgets.renderPaymentMethods({
          selector: '#payment-method',
          variantKey: 'DEFAULT',
        }),
        widgets.renderAgreement({
          selector: '#agreement',
          variantKey: 'AGREEMENT',
        }),
      ])

      setIsReady(true)
    } catch (err: any) {
      console.error('위젯 초기화 오류:', err)
      setError('결제 위젯을 로드하는 중 오류가 발생했습니다.')
    }
  }

  const handlePayment = async () => {
    if (!widgetRef.current || isProcessing) return

    setIsProcessing(true)
    setError(null)

    try {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      await widgetRef.current.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      })
    } catch (err: any) {
      if (err.code === 'USER_CANCEL') {
        setError('결제가 취소되었습니다.')
      } else {
        setError(err.message || '결제 처리 중 오류가 발생했습니다.')
      }
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Script
        src="https://js.tosspayments.com/v2/standard"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.TossPayments) {
            initializeWidget()
          }
        }}
      />

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-lg mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
              &larr; 메인으로 돌아가기
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-4">프리미엄 멤버십</h1>
            <p className="text-gray-600 mt-2">광고 없이 무제한으로 맞춤법 검사를 이용하세요</p>
          </div>

          {/* 상품 정보 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold text-gray-900">결제 정보</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">상품명</span>
                <span className="font-medium">{orderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">혜택</span>
                <span className="text-green-600 font-medium">광고 없음 + 무제한 사용</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-lg font-semibold">결제 금액</span>
                <span className="text-2xl font-bold text-blue-600">{amount.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          {/* 결제 위젯 */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div id="payment-method" className="mb-4"></div>
            <div id="agreement" className="mb-4"></div>

            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
                {error}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={!isReady || isProcessing}
              className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all ${
                isReady && !isProcessing
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  처리 중...
                </span>
              ) : (
                `${amount.toLocaleString()}원 결제하기`
              )}
            </button>
          </div>

          {/* 안내 사항 */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
            <h3 className="font-semibold text-gray-900 mb-2">안내 사항</h3>
            <ul className="space-y-1 list-disc list-inside">
              <li>결제 완료 후 즉시 프리미엄 혜택이 적용됩니다</li>
              <li>멤버십은 결제일로부터 30일간 유효합니다</li>
              <li>환불은 결제 후 7일 이내 가능합니다</li>
              <li>문의: support@pdfgrammercheckorean.site</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}
