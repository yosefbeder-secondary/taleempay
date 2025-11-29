'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { getBookStats, markOrderDelivered, confirmPayment, bulkConfirmPayments, declinePayment } from '@/app/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle }
from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Scanner } from '@yudiel/react-qr-scanner'
import Link from 'next/link'
import { CheckCircle, Clock, Users, BookOpen, Search, Download, FileText, Upload, Image as ImageIcon, ArrowLeft, ArrowRight, Check, AlertCircle, Share2 } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import jsQR from 'jsqr'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type Stats = {
  totalSales: number
  pendingPickup: number
  pendingConfirmationCount: number
  unpaidStudents: number
  delivered: number
  pendingOrders: Array<{
    id: string
    studentName: string
    qrCodeString: string
    createdAt: Date
  }>
  pendingConfirmationOrders: Array<{
    id: string
    studentName: string
    screenshotUrl: string | null
    createdAt: Date
  }>
  unpaidStudentsList: Array<{
    id: string
    name: string
    settingId: string
  }>
  paidOrders: Array<{
    id: string
    studentName: string
    status: string
    createdAt: Date
  }>
}

type Book = {
  id: string
  name: string
  price: number
  classId: number
}

export default function BookDetailsPage() {
  const params = useParams()
  const bookId = params.bookId as string

  const [stats, setStats] = useState<Stats | null>(null)
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [manualCode, setManualCode] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)

  const loadStats = async () => {
    try {
      const data = await getBookStats(bookId)
      if (data) {
        setBook(data.book)
        setStats(data.stats)
      }
    } catch (error) {
      toast.error('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (bookId) {
      loadStats()
    }
  }, [bookId])

  const handleScan = async (text: string) => {
    if (scanning) return
    setScanning(true)
    try {
      const result = await markOrderDelivered(text)
      if (result.success) {
        toast.success(`Delivered to ${result.studentName}`)
        loadStats() // Refresh stats
      } else {
        toast.error(result.error || 'Invalid QR Code')
      }
    } catch (error) {
      toast.error('Error processing QR code')
    } finally {
      setScanning(false)
    }
  }

  const handleConfirmPayment = async (orderId: string) => {
    try {
      await confirmPayment(orderId)
      toast.success('Payment confirmed')
      loadStats()
    } catch (error) {
      toast.error('Failed to confirm payment')
    }
  }

  const handleBulkConfirm = async () => {
    if (!stats || !book) return
    try {
      const result = await bulkConfirmPayments(book.id)
      toast.success(`Confirmed ${result.count} payments`)
      loadStats()
    } catch (error) {
      toast.error('Failed to bulk confirm')
    }
  }

  const [pdfData, setPdfData] = useState<{ type: string, data: any[] } | null>(null)
  const pdfRef = useRef<HTMLDivElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          if (code) {
            handleScan(code.data)
          } else {
            toast.error('No QR code found in image')
          }
        }
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const exportPDF = async (type: 'sales' | 'pending' | 'unpaid') => {
    if (!book || !stats) return

    let data: any[] = []
    if (type === 'sales') {
      data = stats.paidOrders
    } else if (type === 'pending') {
      data = stats.pendingOrders
    } else if (type === 'unpaid') {
      data = stats.unpaidStudentsList
    }

    // Define variables for PDF
    const title = `${book.name}`
    const subtitle = `${type.charAt(0).toUpperCase() + type.slice(1)} Report`
    const date = new Date().toLocaleDateString()

    // Chunk data for pagination
    const ROWS_PER_PAGE = 25
    const chunks = []
    for (let i = 0; i < data.length; i += ROWS_PER_PAGE) {
      chunks.push(data.slice(i, i + ROWS_PER_PAGE))
    }

    const pdf = new jsPDF('p', 'mm', 'a4')
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.left = '-9999px'
    iframe.style.top = '0'
    iframe.style.width = '210mm'
    iframe.style.minHeight = '297mm'
    iframe.style.border = 'none'
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow?.document
    if (!doc) {
      document.body.removeChild(iframe)
      return
    }

    try {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        const isFirstPage = i === 0
        
        // Generate HTML for this chunk
        const rows = chunk.map((item) => {
          let cells = ''
          const cellStyle = 'padding: 12px; border-bottom: 1px solid #e5e7eb;'
          
          cells += `<td style="${cellStyle}">${item.studentName || item.name}</td>`
          if (type === 'sales') cells += `<td style="${cellStyle}">${item.status}</td>`
          if (type === 'pending') cells += `<td style="${cellStyle} font-family: monospace;">${item.qrCodeString}</td>`
          if (type === 'unpaid') cells += `<td style="${cellStyle}">${item.settingId}</td>`
          if (type !== 'unpaid') cells += `<td style="${cellStyle}">${new Date(item.createdAt).toLocaleDateString()}</td>`
          
          return `<tr>${cells}</tr>`
        }).join('')

        const headers = `
          <tr>
            <th style="padding: 12px; text-align: left; font-weight: 600; background-color: #f3f4f6;">Student Name</th>
            ${type === 'sales' ? '<th style="padding: 12px; text-align: left; font-weight: 600; background-color: #f3f4f6;">Status</th>' : ''}
            ${type === 'pending' ? '<th style="padding: 12px; text-align: left; font-weight: 600; background-color: #f3f4f6;">QR Code</th>' : ''}
            ${type === 'unpaid' ? '<th style="padding: 12px; text-align: left; font-weight: 600; background-color: #f3f4f6;">ID</th>' : ''}
            ${type !== 'unpaid' ? '<th style="padding: 12px; text-align: left; font-weight: 600; background-color: #f3f4f6;">Date</th>' : ''}
          </tr>
        `

        doc.open()
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; color: #000000; background-color: #ffffff; margin: 0; padding: 32px; }
                h1 { font-size: 30px; font-weight: bold; margin: 0; }
                p { font-size: 20px; color: #4b5563; margin-top: 4px; }
                table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 24px; }
              </style>
            </head>
            <body>
              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px;">
                <h1>${title}</h1>
                <p>${subtitle} (Page ${i + 1}/${chunks.length})</p>
                <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 14px; color: #6b7280;">
                  <span>Class: ${book.classId}</span>
                  <span>Date: ${date}</span>
                </div>
              </div>
              <table>
                <thead>${headers}</thead>
                <tbody>${rows}</tbody>
              </table>
            </body>
          </html>
        `)
        doc.close()

        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 100))

        const canvas = await html2canvas(doc.body, {
          scale: 2,
          useCORS: true,
          windowWidth: iframe.offsetWidth,
          windowHeight: iframe.offsetHeight
        })
        
        const imgData = canvas.toDataURL('image/jpeg', 0.7)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width
        
        if (!isFirstPage) pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
      }

      pdf.save(`${book.name}_${type}_report.pdf`)
      toast.success(`${type} report downloaded`)

    } catch (error) {
      console.error(error)
      toast.error('Failed to generate PDF')
    } finally {
      document.body.removeChild(iframe)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading stats...</div>
  if (!stats || !book) return <div className="p-8 text-center">Book not found</div>

  const filteredPendingOrders = stats.pendingOrders.filter(order => 
    order.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.qrCodeString.includes(searchTerm)
  )

  const totalPendingAmount = stats.pendingConfirmationOrders.length * book.price

  return (
    <div className="container mx-auto p-4 space-y-6" dir="rtl">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const url = `${window.location.origin}/book/${book.id}`
              navigator.clipboard.writeText(url)
              toast.success('تم نسخ رابط الكتاب')
            }}
            title="نسخ رابط الكتاب"
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{book.name}</h1>
            <p className="text-muted-foreground">الفرقة {book.classId} • {book.price} جنيه</p>
          </div>
        </div>
        
        {/* Report Buttons - New Row */}
        <div className="flex gap-2 overflow-x-auto pb-2">
           <Button variant="outline" onClick={() => exportPDF('sales')} className="whitespace-nowrap">
             <FileText className="ml-2 h-4 w-4" /> تقرير المبيعات
           </Button>
           <Button variant="outline" onClick={() => exportPDF('unpaid')} className="whitespace-nowrap">
             <Users className="ml-2 h-4 w-4" /> قائمة غير دافعين
           </Button>
        </div>
      </div>

      {/* Stats Grid - Filtered */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في انتظار تأكيد الدفع</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingConfirmationCount}</div>
            <p className="text-xs text-muted-foreground">بانتظار الموافقة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في انتظار الاستلام</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPickup}</div>
            <p className="text-xs text-muted-foreground">تم الدفع ولم يستلم</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تم التسليم</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">كتب تم تسليمها</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Confirmation Section */}
      {stats.pendingConfirmationOrders.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/30">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-yellow-800">تأكيدات الدفع</CardTitle>
                <CardDescription>مراجعة وتأكيد مدفوعات الطلاب.</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                <div className="text-right w-full sm:w-auto flex justify-between sm:block">
                  <p className="text-sm text-muted-foreground">إجمالي المعلق</p>
                  <p className="text-xl font-bold text-green-600">{totalPendingAmount} جنيه</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default" className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                      <Check className="ml-2 h-4 w-4" /> تأكيد الكل
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-right">تأكيد جميع المدفوعات؟</DialogTitle>
                      <DialogDescription className="text-right">
                        سيتم تحديد جميع الطلبات المعلقة ({stats.pendingConfirmationOrders.length}) كمدفوعة.
                        <br />
                        إجمالي المبلغ المتوقع: <strong>{totalPendingAmount} جنيه</strong>
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button onClick={handleBulkConfirm}>تأكيد الكل</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm text-right">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">اسم الطالب</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">التاريخ</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">الإثبات</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">إجراء</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {stats.pendingConfirmationOrders.map((order) => (
                    <tr key={order.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">{order.studentName}</td>
                      <td className="p-4 align-middle text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                      <td className="p-4 align-middle">
                        {order.screenshotUrl ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <ImageIcon className="ml-2 h-4 w-4" /> عرض الصورة
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle className="text-right">إثبات الدفع - {order.studentName}</DialogTitle>
                              </DialogHeader>
                              <div className="flex justify-center p-4 bg-black/5 rounded-lg">
                                <img 
                                  src={order.screenshotUrl} 
                                  alt="Payment Screenshot" 
                                  className="max-h-[600px] object-contain rounded"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-muted-foreground italic">لا توجد صورة</span>
                        )}
                      </td>
                      <td className="p-4 align-middle text-left flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleConfirmPayment(order.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          تأكيد
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={async () => {
                            if (confirm('هل أنت متأكد من رفض هذا الدفع؟')) {
                              try {
                                await declinePayment(order.id)
                                toast.success('تم رفض الدفع')
                                loadStats()
                              } catch (e) {
                                toast.error('فشل رفض الدفع')
                              }
                            }
                          }}
                        >
                          رفض
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* QR Scanner Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>ماسح QR</CardTitle>
                  <CardDescription>امسح كود الطالب لتسليمه الكتاب.</CardDescription>
                </div>
                <Button 
                  variant={showScanner ? "destructive" : "default"} 
                  onClick={() => setShowScanner(!showScanner)}
                >
                  {showScanner ? "إيقاف الكاميرا" : "تشغيل الكاميرا"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showScanner ? (
                <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                  <Scanner 
                    onScan={(result) => {
                      if (result && result.length > 0) {
                        handleScan(result[0].rawValue)
                      }
                    }}
                  />
                  {scanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                      جاري المعالجة...
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                  <p>الكاميرا متوقفة</p>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    أو أدخل يدوياً / رفع صورة
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Input 
                  placeholder="أدخل كود QR UUID" 
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="text-right"
                />
                <Button onClick={() => handleScan(manualCode)} disabled={scanning || !manualCode}>
                  تأكيد
                </Button>
              </div>

              <div className="flex items-center justify-center w-full">
                <label htmlFor="qr-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">اضغط لرفع</span> صورة QR</p>
                  </div>
                  <input id="qr-upload" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Orders List */}
        <Card className="h-full flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>في انتظار الاستلام</CardTitle>
                <CardDescription>طلاب دفعوا ولم يستلموا بعد.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => exportPDF('pending')} title="تحميل القائمة">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative mt-2">
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8 text-right"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto max-h-[500px]">
            {filteredPendingOrders.length > 0 ? (
              <div className="relative w-full">
                <table className="w-full caption-bottom text-sm text-right">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">اسم الطالب</th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">كود QR</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {filteredPendingOrders.map((order: any) => (
                      <tr key={order.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle font-medium">
                          <div className="flex flex-col">
                            <span>{order.studentName}</span>
                            <span className="text-xs text-muted-foreground font-mono">{order.qrCodeString.slice(0, 8)}...</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle font-mono text-xs">{order.qrCodeString}</td>
                        <td className="p-4 align-middle text-left">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleScan(order.qrCodeString)}
                            disabled={scanning}
                          >
                            تسليم
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                لا يوجد طلاب في الانتظار.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
