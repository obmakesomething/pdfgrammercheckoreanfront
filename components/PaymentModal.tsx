'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    TossPayments: any
  }
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  paymentInfo: {
    charCount: number
    amount: number
    orderId: string
    orderName: string
  } | null
  email: string
  pdfFile: File | null
}

export default function PaymentModal({
  isOpen,
  onClose,
  paymentInfo,
  email,
  pdfFile
}: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const tossPaymentsRef = useRef<any>(null)

  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'

  useEffect(() => {
    // Check if TossPayments SDK is loaded
    const checkSdk = () => {
      if (typeof window !== 'undefined' && window.TossPayments) {
        setSdkLoaded(true)
        try {
          tossPaymentsRef.current = window.TossPayments(clientKey)
        } catch (err) {
          console.error('TossPayments initialization error:', err)
          setError('결제 시스템 초기화에 실패했습니다.')
        }
      }
    }

    // Initial check
    checkSdk()

    // Poll for SDK load if not immediately available
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.TossPayments) {
        checkSdk()
        clearInterval(interval)
      }
    }, 100)

    // Cleanup
    return () => clearInterval(interval)
  }, [clientKey])

  const handlePayment = async () => {
    if (!paymentInfo || !sdkLoaded || !tossPaymentsRef.current) {
      setError('결제 시스템이 로드되지 않았습니다. 페이지를 새로고침해주세요.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Store payment info in sessionStorage for success page
      sessionStorage.setItem('paymentInfo', JSON.stringify({
        orderId: paymentInfo.orderId,
        email: email,
        fileName: pdfFile?.name || '',
        charCount: paymentInfo.charCount,
        amount: paymentInfo.amount
      }))

      // Store file for later processing
      if (pdfFile) {
        const reader = new FileReader()
        reader.onload = () => {
          sessionStorage.setItem('pendingPdfFile', reader.result as string)
          sessionStorage.setItem('pendingPdfFileName', pdfFile.name)
        }
        reader.readAsDataURL(pdfFile)
      }

      const successUrl = `${window.location.origin}/payment/success`
      const failUrl = `${window.location.origin}/payment/fail`

      await tossPaymentsRef.current.requestPayment('카드', {
        amount: paymentInfo.amount,
        orderId: paymentInfo.orderId,
        orderName: paymentInfo.orderName,
        customerEmail: email,
        successUrl: successUrl,
        failUrl: failUrl,
      })
    } catch (err: any) {
      console.error('Payment error:', err)
      if (err.code === 'USER_CANCEL') {
        setError('결제가 취소되었습니다.')
      } else {
        setError(err.message || '결제 요청 중 오류가 발생했습니다.')
      }
      setIsLoading(false)
    }
  }

  if (!isOpen || !paymentInfo) return null

  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">유료 결제 안내</h2>
            <p className="text-gray-600 mt-2">
              5만자 이상의 문서는 유료 서비스입니다
            </p>
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>문서 글자 수</span>
              <span className="font-semibold">{formatNumber(paymentInfo.charCount)}자</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>기본 무료 한도</span>
              <span className="font-semibold">50,000자</span>
            </div>
            <div className="border-t border-blue-200 pt-3">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>결제 금액</span>
                <span className="text-blue-600">{formatNumber(paymentInfo.amount)}원</span>
              </div>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            <p>* 5만자 초과 시 1,000자당 10원</p>
            <p>* 결제 후 맞춤법 검사 결과를 이메일로 발송해드립니다</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* SDK Loading Status */}
          {!sdkLoaded && (
            <div className="text-yellow-600 text-sm">
              결제 시스템 로딩 중...
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handlePayment}
              disabled={isLoading || !sdkLoaded}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-all ${
                isLoading || !sdkLoaded
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isLoading ? '처리 중...' : '결제하기'}
            </button>
          </div>

          {/* Toss Logo */}
          <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <span>결제는</span>
            <span className="font-semibold text-blue-500">토스페이먼츠</span>
            <span>를 통해 안전하게 처리됩니다</span>
          </div>
        </div>
      </div>
    </div>
  )
}
