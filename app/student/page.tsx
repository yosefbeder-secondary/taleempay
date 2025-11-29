'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'
import { getStudentProducts, setStudentCookie, clearStudentCookie, getStudentFromCookie } from '@/app/actions'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { StudentSelector } from '@/components/student-selector'

type Student = {
  id: string
  name: string
  settingId: string
  classId: number
}

type ProductWithOrder = {
  id: string
  name: string
  price: number
  order: {
    id: string
    status: string
  } | null
  admin?: {
    name: string
  }
  type: 'BOOK' | 'COURSE'
}

export default function StudentPage() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [products, setProducts] = useState<ProductWithOrder[]>([])
  const [loading, setLoading] = useState(false)

  // Load saved student from cookie or localStorage
  useEffect(() => {
    async function loadStudent() {
      // Try cookie first
      const cookieStudent = await getStudentFromCookie()
      if (cookieStudent) {
        handleSelectStudent(cookieStudent)
        return
      }

      // Fallback to localStorage
      const savedStudent = localStorage.getItem('selectedStudent')
      if (savedStudent) {
        try {
          const parsed = JSON.parse(savedStudent)
          handleSelectStudent(parsed)
        } catch (e) {
          console.error('Failed to parse saved student', e)
        }
      }
    }
    loadStudent()
  }, [])

  async function handleSelectStudent(student: Student) {
    setSelectedStudent(student)
    localStorage.setItem('selectedStudent', JSON.stringify(student))
    await setStudentCookie(student.id) // Set cookie
    setLoading(true)
    const data = await getStudentProducts(student.id)
    if (data) {
      setProducts(data.products)
    }
    setLoading(false)
  }

  async function handleClearStudent() {
    setSelectedStudent(null)
    localStorage.removeItem('selectedStudent')
    await clearStudentCookie() // Clear cookie
    setProducts([])
  }

  function getStatusBadge(status: string | undefined, type: 'BOOK' | 'COURSE') {
    switch (status) {
      case 'PAID':
        return <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs"><CheckCircle className="w-3 h-3 mr-1" /> {type === 'COURSE' ? 'تم الدفع' : 'تم الدفع'}</div>
      case 'DELIVERED':
        return <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-xs"><CheckCircle className="w-3 h-3 mr-1" /> {type === 'COURSE' ? 'تم التفعيل' : 'تم الاستلام'}</div>
      case 'PENDING_CONFIRMATION':
        return <div className="flex items-center text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs"><Clock className="w-3 h-3 mr-1" /> في الانتظار</div>
      case 'DECLINED':
        return <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded text-xs"><XCircle className="w-3 h-3 mr-1" /> تم الرفض</div>
      default:
        return <div className="flex items-center text-gray-500 bg-gray-50 px-2 py-1 rounded text-xs"><AlertCircle className="w-3 h-3 mr-1" /> لم يتم الطلب</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-20 h-20">
            <Image 
              src="/logo.png" 
              alt="TaleemPay Logo" 
              fill 
              className="object-contain"
            />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">TaleemPay</h1>
            <p className="text-muted-foreground">بوابة الطلاب - ابحث عن اسمك لمتابعة حالة منتجاتك الدراسية</p>
          </div>
        </div>

        {!selectedStudent ? (
          <Card>
            <CardHeader>
              <CardTitle>البحث عن طالب</CardTitle>
              <CardDescription>أدخل اسمك أو رقم الجلوس</CardDescription>
            </CardHeader>
            <CardContent>
              <StudentSelector 
                selectedStudent={selectedStudent} 
                onSelect={handleSelectStudent} 
                onClear={handleClearStudent} 
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
              <div>
                <h2 className="text-xl font-bold">{selectedStudent.name}</h2>
                <p className="text-muted-foreground">الفرقة {selectedStudent.classId} • {selectedStudent.settingId}</p>
              </div>
              <Button variant="outline" onClick={handleClearStudent}>
                تغيير الطالب
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-12">جاري تحميل المنتجات...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {products.map(product => (
                  <Card key={product.id} className={cn(
                    "transition-all hover:shadow-md",
                    product.order?.status === 'PAID' ? "border-blue-200 bg-blue-50/30" :
                    product.order?.status === 'DELIVERED' ? "border-green-200 bg-green-50/30" :
                    ""
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {product.type === 'COURSE' ? (
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm font-medium">كورس</span>
                          ) : (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-medium">كتاب</span>
                          )}
                          <span className="flex-1">{product.name}</span>
                        </CardTitle>
                        {getStatusBadge(product.order?.status, product.type)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground mb-4">
                        السعر: {product.price} جنيه
                        {product.admin && (
                          <span className="block mt-1 text-xs">
                            إضافة: {product.admin.name}
                          </span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/product/${product.id}`} className="w-full">
                        <Button className="w-full" variant={product.order ? "secondary" : "default"}>
                          {product.order ? 'عرض التفاصيل' : 'شراء المنتج'}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
                {products.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    لا توجد منتجات متاحة لفرقتك حالياً.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
