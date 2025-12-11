'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'processing' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('결제를 확인하고 있습니다...')
  const [errorDetail, setErrorDetail] = useState<string | null>(null)

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey')
      const orderId = searchParams.get('orderId')
      const amount = searchParams.get('amount')

      if (!paymentKey || !orderId || !amount) {
        setStatus('error')
        setMessage('결제 정보가 올바르지 않습니다.')
        return
      }

      // Get stored payment info
      const storedInfo = sessionStorage.getItem('paymentInfo')
      const storedFileData = sessionStorage.getItem('pendingPdfFile')
      const storedFileName = sessionStorage.getItem('pendingPdfFileName')

      if (!storedInfo) {
        setStatus('error')
        setMessage('결제 정보를 찾을 수 없습니다. 처음부터 다시 시도해주세요.')
        return
      }

      const paymentInfo = JSON.parse(storedInfo)

      try {
        setStatus('verifying')
        setMessage('결제를 확인하고 있습니다...')

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.pdfgrammercheckorean.site'

        // Step 1: Confirm payment with backend
        const confirmResponse = await fetch(`${apiUrl}/api/payment/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: parseInt(amount),
          }),
        })

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json()
          throw new Error(errorData.message || '결제 확인에 실패했습니다.')
        }

        const confirmData = await confirmResponse.json()

        if (!confirmData.success) {
          throw new Error(confirmData.message || '결제 확인에 실패했습니다.')
        }

        setStatus('processing')
        setMessage('결제가 완료되었습니다. PDF 맞춤법 검사를 진행합니다...')

        // Step 2: Process PDF with payment token
        if (storedFileData && storedFileName) {
          // Convert base64 back to file
          const response = await fetch(storedFileData)
          const blob = await response.blob()
          const file = new File([blob], storedFileName, { type: 'application/pdf' })

          const formData = new FormData()
          formData.append('pdf', file)
          formData.append('email', paymentInfo.email)
          formData.append('payment_token', confirmData.payment_token || paymentKey)
          formData.append('order_id', orderId)

          const processResponse = await fetch(`${apiUrl}/api/check-pdf`, {
            method: 'POST',
            body: formData,
          })

          if (processResponse.ok) {
            // Download the processed PDF
            const pdfBlob = await processResponse.blob()
            const url = window.URL.createObjectURL(pdfBlob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${storedFileName.replace('.pdf', '')}_맞춤법검사.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            setStatus('success')
            setMessage('맞춤법 검사가 완료되었습니다!')

            // Clear stored data
            sessionStorage.removeItem('paymentInfo')
            sessionStorage.removeItem('pendingPdfFile')
            sessionStorage.removeItem('pendingPdfFileName')
          } else {
            const errorData = await processResponse.json()
            throw new Error(errorData.message || 'PDF 처리 중 오류가 발생했습니다.')
          }
        } else {
          // No file stored, just show success
          setStatus('success')
          setMessage('결제가 완료되었습니다. 메인 페이지에서 다시 시도해주세요.')

          // Clear stored data
          sessionStorage.removeItem('paymentInfo')
        }

      } catch (error: any) {
        console.error('Payment confirmation error:', error)
        setStatus('error')
        setMessage('처리 중 오류가 발생했습니다.')
        setErrorDetail(error.message)
      }
    }

    confirmPayment()
  }, [searchParams])

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center space-y-6">
          {/* Status Icon */}
          <div className="flex justify-center">
            {status === 'verifying' && (
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            )}
            {status === 'processing' && (
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
            )}
            {status === 'success' && (
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Status Message */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {status === 'verifying' && '결제 확인 중'}
              {status === 'processing' && '처리 중'}
              {status === 'success' && '완료!'}
              {status === 'error' && '오류 발생'}
            </h1>
            <p className="text-gray-600 mt-2">{message}</p>
            {errorDetail && (
              <p className="text-red-500 text-sm mt-2">{errorDetail}</p>
            )}
          </div>

          {/* Success Info */}
          {status === 'success' && (
            <div className="bg-green-50 rounded-lg p-4 text-left space-y-2">
              <p className="text-green-800 text-sm">
                <span className="font-semibold">PDF 다운로드:</span> 자동으로 시작됩니다
              </p>
              <p className="text-green-800 text-sm">
                <span className="font-semibold">이메일 발송:</span> 입력하신 이메일로도 결과를 보내드립니다
              </p>
            </div>
          )}

          {/* Color Legend */}
          {status === 'success' && (
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="font-semibold text-gray-700 mb-2">색상별 의미:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-gray-600">띄어쓰기</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-gray-600">맞춤법/오타</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="text-gray-600">문법</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                  <span className="text-gray-600">기타</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          {(status === 'success' || status === 'error') && (
            <button
              onClick={handleGoHome}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              메인 페이지로 돌아가기
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </main>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
