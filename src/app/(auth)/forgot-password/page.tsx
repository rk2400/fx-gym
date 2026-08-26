'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardTitle, CardDescription, CardContent, CardHeader } from '@/components/ui/card'
import {
  Loader2,
  Mail,
  Lock,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from '@/lib/validations/auth'
import { toast } from 'sonner'
import { AmbientBackground } from '@/components/visuals'

type Step = 'email' | 'reset' | 'success'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [code, setCode] = useState('')

  const emailForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onRequestCode = async (data: ForgotPasswordInput) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || 'Failed to send reset code')
        return
      }

      setEmail(data.email)
      setStep('reset')
      toast.success('Reset code sent! Check your email.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const onResetPassword = async (data: ResetPasswordInput) => {
    if (code.length !== 6) {
      toast.error('Enter the 6-digit code from your email')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: data.password }),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || 'Invalid or expired code')
        return
      }

      setStep('success')
      toast.success('Password updated! You can sign in now.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden flex items-center justify-center py-12 px-4">
      <AmbientBackground />

      {step === 'success' ? (
        <Card className="relative w-full max-w-md">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-6 inline-flex rounded-full bg-gym-primary/10 p-4">
              <CheckCircle2 className="h-10 w-10 text-gym-primary" aria-hidden="true" />
            </div>
            <CardTitle className="mb-3 text-2xl">Password Updated!</CardTitle>
            <p className="text-gym-text-muted mb-6">
              Your password has been changed successfully. You can now sign in with your new password.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Back to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="relative w-full max-w-md">
          <CardHeader className="text-center">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <KeyRound className="h-8 w-8 text-gym-primary" aria-hidden="true" />
              <span className="font-heading text-xl font-bold text-gym-text">FX Gym</span>
            </Link>
            <CardTitle className="text-2xl">
              {step === 'email' ? 'Forgot Password?' : 'Enter Reset Code'}
            </CardTitle>
            <CardDescription>
              {step === 'email'
                ? "Enter your account email and we'll send you a reset code."
                : <>We sent a 6-digit code to <span className="font-medium text-gym-text">{email}</span>. It expires in 15 minutes.</>}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 'email' ? (
              <form onSubmit={emailForm.handleSubmit(onRequestCode)} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gym-text-muted" aria-hidden="true" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      {...emailForm.register('email')}
                      aria-invalid={emailForm.formState.errors.email ? 'true' : 'false'}
                      disabled={isLoading}
                    />
                  </div>
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-gym-accent" role="alert">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Sending Code...
                    </>
                  ) : (
                    'Send Reset Code'
                  )}
                </Button>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center text-sm text-gym-text-muted hover:text-gym-text"
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                    Back to Sign In
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="code">Reset Code</Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                    autoComplete="one-time-code"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gym-text-muted" aria-hidden="true" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      {...resetForm.register('password')}
                      aria-invalid={resetForm.formState.errors.password ? 'true' : 'false'}
                      disabled={isLoading}
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
                  {resetForm.formState.errors.password && (
                    <p className="text-sm text-gym-accent" role="alert">
                      {resetForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gym-text-muted" aria-hidden="true" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="pl-10"
                      {...resetForm.register('confirmPassword')}
                      aria-invalid={resetForm.formState.errors.confirmPassword ? 'true' : 'false'}
                      disabled={isLoading}
                    />
                  </div>
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-gym-accent" role="alert">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Updating Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="inline-flex items-center text-sm text-gym-text-muted hover:text-gym-text"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                    Use different email
                  </button>
                  <Link href="/login" className="text-sm text-gym-primary hover:text-gym-primary-dim">
                    Sign in instead
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}