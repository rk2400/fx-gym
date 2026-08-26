'use client'

import { useState } from 'react'
import { getSession, signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Dumbbell, Loader2, Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { AmbientBackground } from '@/components/visuals'

// NOTE: page files must only have a default export (Next.js App Router constraint)
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'login' | 'otp'>('login')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: true,
    },
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error.includes('verify') || result.error.includes('OTP')) {
          setOtpEmail(data.email)
          setStep('otp')
          toast.info('Please check your email for the verification code')
          return
        }
        toast.error(result.error || 'Invalid email or password')
        return
      }

      toast.success('Welcome back!')

      // Route each role to its own dashboard (admins -> /admin, trainers -> /trainer)
      const session = await getSession()
      const role = session?.user?.role
      const roleHome = role === 'ADMIN' ? '/admin' : role === 'TRAINER' ? '/trainer/clients' : '/dashboard'
      router.push(callbackUrl !== '/dashboard' ? callbackUrl : roleHome)
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await signIn('credentials', {
        email: otpEmail,
        password: otpCode,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error || 'Invalid or expired code')
        return
      }

      toast.success('Email verified! Welcome to FX Gym!')

      // Route each role to its own dashboard (admins -> /admin, trainers -> /trainer)
      const otpSession = await getSession()
      const otpRole = otpSession?.user?.role
      const otpHome = otpRole === 'ADMIN' ? '/admin' : otpRole === 'TRAINER' ? '/trainer/clients' : '/dashboard'
      router.push(callbackUrl !== '/dashboard' ? callbackUrl : otpHome)
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resendOtp = async () => {
    try {
      await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, type: 'EMAIL_VERIFICATION' }),
      })
      toast.success('New code sent to your email')
    } catch {
      toast.error('Failed to resend code')
    }
  }

  if (step === 'otp') {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden flex items-center justify-center py-12 px-4">
        <AmbientBackground />
        <Card className="relative w-full max-w-md">
          <CardHeader className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <Dumbbell className="h-8 w-8 text-gym-primary" aria-hidden="true" />
              <span className="font-heading text-xl font-bold text-gym-text">FX Gym</span>
            </Link>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>Enter the 6-digit code sent to <strong>{otpEmail}</strong></CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest"
                  maxLength={6}
                  autoComplete="one-time-code"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || otpCode.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button variant="ghost" size="sm" onClick={resendOtp} disabled={isLoading}>
                Resend Code
              </Button>
              <p className="mt-2 text-sm text-gym-text-muted">
                Didn't receive it? Check your spam folder or{' '}
                <button
                  type="button"
                  onClick={() => { setStep('login'); reset(); }}
                  className="text-gym-primary hover:text-gym-primary-dim underline"
                >
                  go back
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden flex items-center justify-center py-12 px-4">
      <AmbientBackground />
      <Card className="relative w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Dumbbell className="h-8 w-8 text-gym-primary" aria-hidden="true" />
            <span className="font-heading text-xl font-bold text-gym-text">FX Gym</span>
          </Link>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gym-text-muted" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...register('email')}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-sm text-gym-accent" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-sm text-gym-primary hover:text-gym-primary-dim">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gym-text-muted" aria-hidden="true" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register('password')}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gym-text-muted hover:text-gym-text"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-gym-accent" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 rounded border-gym-border bg-gym-surface text-gym-primary focus:ring-gym-primary"
                />
                <span className="text-sm text-gym-text-muted">Remember me</span>
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gym-text-muted">
            New to FX Gym? Contact admin to create your account.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <p className="text-sm text-gym-text-muted text-center">
            Need help? <Link href="/contact" className="text-gym-primary hover:text-gym-primary-dim font-medium">Contact Support</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return <LoginForm />
}