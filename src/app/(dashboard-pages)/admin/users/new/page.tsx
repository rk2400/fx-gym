'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  UserPlus, ArrowLeft, Mail, KeyRound, ShieldCheck, Loader2,
  Copy, CheckCircle2, Info, Hash,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn, formatPrice } from '@/lib/utils'

interface PricingPack {
  id: string
  name: string
  price: string | number
  duration: number
}

interface Trainer {
  id: string
  name: string
  email: string
}

interface EnrollResult {
  user: { name: string; email: string; role: string }
  credentials: {
    memberId: string
    tempPassword: string
  }
  emailSent?: boolean
  emailPreviewUrl?: string | null
}

const roleOptions = [
  { value: 'MEMBER', label: 'Member' },
  { value: 'TRAINER', label: 'Trainer' },
  { value: 'ADMIN', label: 'Admin' },
]

const initialForm = {
  name: '',
  email: '',
  role: 'MEMBER',
  membershipId: '',
  assignedTrainerId: '',
  phone: '',
  weightKg: '',
  heightCm: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  address: '',
}

export default function NewUserPage() {
  const [form, setForm] = useState(initialForm)
  const [packs, setPacks] = useState<PricingPack[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<EnrollResult | null>(null)

  useEffect(() => {
    fetch('/api/pricing')
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => { if (Array.isArray(d)) setPacks(d) })
      .catch(() => {})

    fetch('/api/admin/trainers')
      .then((r) => (r.ok ? r.json() : { trainers: [] }))
      .then((d) => setTrainers(d.trainers || []))
      .catch(() => {})
  }, [])

  const update = (key: keyof typeof initialForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Enter a valid email address'
    if (form.phone && !/^\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit phone number'
    if (form.emergencyContactPhone && !/^\d{10}$/.test(form.emergencyContactPhone)) e.emergencyContactPhone = 'Enter a valid 10-digit phone number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          role: form.role,
          membershipId: form.role === 'MEMBER' && form.membershipId ? form.membershipId : undefined,
          assignedTrainerId:
            form.role === 'MEMBER' && form.assignedTrainerId ? form.assignedTrainerId : undefined,
          phone: form.phone.trim() || undefined,
          weightKg: form.weightKg ? Number(form.weightKg) : undefined,
          heightCm: form.heightCm ? Number(form.heightCm) : undefined,
          emergencyContactName: form.emergencyContactName.trim() || undefined,
          emergencyContactPhone: form.emergencyContactPhone.trim() || undefined,
          address: form.address.trim() || undefined,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to enroll user')
      }

      setResult(data)
      toast.success('User enrolled! Credentials and OTP have been emailed.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to enroll user')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setResult(null)
    setForm(initialForm)
    setErrors({})
  }

  const copyValue = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copied to clipboard`)
    } catch {
      toast.error('Could not copy – please select it manually')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          href="/admin/users"
          className="inline-flex items-center text-sm text-gym-text-muted hover:text-gym-text mb-3 transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Back to Users
        </Link>
        <h1 className="heading-2 text-gym-text flex items-center space-x-2">
          <UserPlus className="h-7 w-7 text-gym-primary" aria-hidden="true" />
          <span>Enroll New User</span>
        </h1>
        <p className="text-gym-text-muted mt-1">
          Create an account and email login credentials with a verification code
        </p>
      </motion.div>

      {result ? (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="bg-gym-surface border-gym-primary/40">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-6 w-6 text-gym-primary" aria-hidden="true" />
                <CardTitle className="text-gym-text">Enrollment successful!</CardTitle>
              </div>
              <CardDescription className="text-gym-text-muted">
                {result.user.name} ({result.user.email}) ·{' '}
                <Badge variant="secondary">{result.user.role}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-gym-border bg-gym-bg p-4">
                <div className="flex items-center justify-between py-2 border-b border-gym-border">
                  <span className="flex items-center text-sm text-gym-text-muted">
                    <Hash className="h-4 w-4 mr-1.5" aria-hidden="true" /> Member ID
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-bold text-gym-primary">{result.credentials.memberId}</code>
                    <button onClick={() => copyValue('Member ID', result.credentials.memberId)} aria-label="Copy member ID" className="p-1 rounded hover:bg-gym-surface">
                      <Copy className="h-4 w-4 text-gym-text-muted" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center text-sm text-gym-text-muted">
                    <KeyRound className="h-4 w-4 mr-1.5" aria-hidden="true" /> Starter password
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="font-mono font-bold text-gym-secondary">{result.credentials.tempPassword}</code>
                    <button onClick={() => copyValue('Password', result.credentials.tempPassword)} aria-label="Copy password" className="p-1 rounded hover:bg-gym-surface">
                      <Copy className="h-4 w-4 text-gym-text-muted" />
                    </button>
                  </div>
                </div>
              </div>

              {result.emailSent === false ? (
                <div className="flex items-start gap-2 rounded-lg bg-gym-warning/10 border border-gym-warning/30 p-3 text-sm text-gym-warning">
                  <Mail className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>Email could not be sent right now – share the credentials below with the user manually.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-sm text-green-400">
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Welcome email sent successfully{result.emailPreviewUrl ? ' (test inbox)' : ''}.</span>
                  {result.emailPreviewUrl && (
                    <a
                      href={result.emailPreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium hover:text-green-300"
                    >
                      Open message preview →
                    </a>
                  )}
                </div>
              )}

              <div className="flex items-start gap-2 rounded-lg bg-gym-bg/60 border border-gym-border p-3 text-sm text-gym-text-muted">
                <Mail className="h-4 w-4 mt-0.5 shrink-0 text-gym-secondary" aria-hidden="true" />
                <span>
                  Credentials and membership details were emailed to{' '}
                  <span className="text-gym-text">{result.user.email}</span>. The account activates
                  automatically the first time they sign in with this password.
                </span>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <Button variant="outline" onClick={resetForm}>Enroll another</Button>
                <Button asChild><Link href="/admin/users">Back to Users</Link></Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="bg-gym-surface border-gym-border">
            <CardHeader>
              <CardTitle className="text-gym-text">User details</CardTitle>
              <CardDescription className="text-gym-text-muted">
                Credentials are generated automatically and sent by email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="John Doe" aria-invalid={!!errors.name} />
                    {errors.name && <p className="text-sm text-gym-accent">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="user@example.com" aria-invalid={!!errors.email} />
                    {errors.email && <p className="text-sm text-gym-accent">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select id="role" value={form.role} onChange={(e) => update('role', e.target.value)} className="input-field">
                      {roleOptions.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  {form.role === 'MEMBER' && (
                    <div className="space-y-2">
                      <Label htmlFor="trainer">Assign Trainer (optional)</Label>
                      <select id="trainer" value={form.assignedTrainerId} onChange={(e) => update('assignedTrainerId', e.target.value)} className="input-field">
                        <option value="">None</option>
                        {trainers.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {form.role === 'MEMBER' && (
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="membership">Membership Pack (optional)</Label>
                      <select id="membership" value={form.membershipId} onChange={(e) => update('membershipId', e.target.value)} className="input-field">
                        <option value="">No pack – enroll without a plan</option>
                        {packs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} · {formatPrice(typeof p.price === 'string' ? parseFloat(p.price) : p.price)} · {p.duration} days
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Optional profile details */}
                <div className="border-t border-gym-border pt-5">
                  <p className="text-sm font-medium text-gym-text-muted mb-4">Additional Details (all optional)</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gym-text-muted" aria-hidden="true">+91</span>
                        <Input
                          id="phone"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="98765 43210"
                          className="pl-12"
                          value={form.phone}
                          onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        />
                      </div>
                      {errors.phone && <p className="text-sm text-gym-accent" role="alert">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" placeholder="Street, City, State, ZIP" value={form.address} onChange={(e) => update('address', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weightKg">Weight (kg)</Label>
                      <Input id="weightKg" type="number" step="0.1" min="0" max="500" placeholder="75" value={form.weightKg} onChange={(e) => update('weightKg', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heightCm">Height (cm)</Label>
                      <Input id="heightCm" type="number" step="0.1" min="0" max="300" placeholder="180" value={form.heightCm} onChange={(e) => update('heightCm', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                      <Input id="emergencyContactName" placeholder="Jane Doe" value={form.emergencyContactName} onChange={(e) => update('emergencyContactName', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gym-text-muted" aria-hidden="true">+91</span>
                        <Input
                          id="emergencyContactPhone"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="98765 43210"
                          className="pl-12"
                          value={form.emergencyContactPhone}
                          onChange={(e) => update('emergencyContactPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        />
                      </div>
                      {errors.emergencyContactPhone && <p className="text-sm text-gym-accent" role="alert">{errors.emergencyContactPhone}</p>}
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gym-text-muted">
                    Members can update these anytime from their dashboard profile page.
                  </p>
                </div>

                <div className="flex items-start gap-2 rounded-lg bg-gym-bg/60 border border-gym-border p-3 text-sm text-gym-text-muted">
                  <Info className="h-4 w-4 mt-0.5 shrink-0 text-gym-secondary" aria-hidden="true" />
                  <span>
                    The user is created as <strong className="text-gym-text">unverified &amp; inactive</strong>.
                    They receive an email with their credentials and membership details, and their account is
                    activated automatically on first successful login.
                  </span>
                </div>

                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enrolling…</>
                  ) : (
                    <><UserPlus className="mr-2 h-4 w-4" /> Enroll User</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
