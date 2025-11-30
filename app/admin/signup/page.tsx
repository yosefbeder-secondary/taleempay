'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { signupAdmin } from '@/app/actions'
import Image from 'next/image'

import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    setError('')
    setSuccess('')

    try {
      const result = await signupAdmin({ name, username, password, passcode })
      if (result.success) {
        setSuccess('تم إنشاء الحساب بنجاح')
        toast.success('تم إنشاء الحساب بنجاح')
        setTimeout(() => router.push('/admin'), 1500)
      } else {
        setError(result.error || 'فشل إنشاء الحساب')
        toast.error(result.error || 'فشل إنشاء الحساب')
      }
    } catch (error) {
      setError('حدث خطأ أثناء إنشاء الحساب')
      toast.error('حدث خطأ أثناء إنشاء الحساب')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="relative w-16 h-16 mx-auto">
            <Image 
              src="/logo.png" 
              alt="TaleemPay Logo" 
              fill 
              className="object-contain"
            />
          </div>
          <CardTitle className="text-2xl">TaleemPay</CardTitle>
          <CardDescription>إنشاء حساب مسؤول جديد</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4 pb-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 border-green-500 text-green-700 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-700" />
                <AlertTitle>نجاح</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">الاسم الكامل</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passcode">رمز المرور</Label>
              <Input
                id="passcode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                className="text-right"
                placeholder="أدخل رمز المرور الخاص بالمسؤولين"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'جاري الإنشاء...' : 'إنشاء حساب'}
            </Button>
            <div className="text-center text-sm">
              لديك حساب بالفعل؟{' '}
              <Link href="/admin/login" className="text-primary hover:underline">
                تسجيل الدخول
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
