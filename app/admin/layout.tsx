import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key-change-me')

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  // Allow access to login and signup pages without token
  // We can't easily check the current path in server component layout without headers or middleware
  // But layout wraps pages. If we are in /admin/login, this layout runs.
  // Wait, if we redirect from here, we might cause infinite loop if we are already on login page.
  // Next.js Layouts don't know the pathname directly.
  // A better approach for route protection is Middleware.
  // However, the user asked for "redirection if the admin isn't authenticated".
  // Let's use Middleware for this as it's the standard way.
  // Or, we can check headers.
  
  // Let's try to use headers to get pathname if possible, or just use Middleware.
  // Middleware is safer.
  // But I'll stick to the plan of using layout if I can, or switch to middleware if needed.
  // Actually, for a layout in `app/admin`, it applies to all sub-routes.
  // If I put this check here, it will run for `/admin/login` too.
  // So I need to exclude login/signup.
  
  // Alternative: Move login/signup OUT of `app/admin`? No, user wants `/admin/login`.
  // Alternative: Use Route Groups `(auth)` and `(dashboard)`.
  // `app/admin/(auth)/login` and `app/admin/(dashboard)/...`
  // Then put layout only in `(dashboard)`.
  
  // Let's refactor to use Route Groups.
  // 1. Move `app/admin/page.tsx` and `app/admin/book` and `app/admin/profile` to `app/admin/(dashboard)/...`
  // 2. Move `app/admin/login` and `app/admin/signup` to `app/admin/(auth)/...`
  // 3. Create `app/admin/(dashboard)/layout.tsx` with the check.
  
  // This is a bit of a refactor.
  // Simpler way: Middleware.
  // I'll create `middleware.ts` in the root.
  
  return (
    <>
      {children}
    </>
  )
}
