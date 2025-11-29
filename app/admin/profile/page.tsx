'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { updateAdminProfile, logoutAdmin } from '@/app/actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      await updateAdminProfile({ 
        name: name || undefined, 
        password: password || undefined 
      })
      toast.success('تم تحديث البيانات بنجاح')
      setPassword('')
    } catch (error) {
      toast.error('فشل تحديث البيانات')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await logoutAdmin()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-md mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">الملف الشخصي</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تحديث البيانات</CardTitle>
            <CardDescription>قم بتحديث اسمك أو كلمة المرور.</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اتركه فارغاً لعدم التغيير"
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور الجديدة</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="اتركه فارغاً لعدم التغيير"
                  className="text-right"
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'جاري التحديث...' : 'حفظ التغييرات'}
              </Button>
              <Button type="button" variant="destructive" className="w-full" onClick={handleLogout}>
                تسجيل الخروج
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
