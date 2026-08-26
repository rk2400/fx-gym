'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  Dumbbell,
  Camera,
  Loader2,
  User as UserIcon,
  Scale,
  Ruler,
  HeartPulse,
  MapPin,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

interface ProfileData {
  id: string
  email: string
  name: string | null
  memberId: string | null
  role: string
  phone: string | null
  weightKg: number | null
  heightCm: number | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  address: string | null
}

type FormState = {
  name: string
  phone: string
  weightKg: string
  heightCm: string
  emergencyContactName: string
  emergencyContactPhone: string
  address: string
}

const emptyForm: FormState = {
  name: '',
  phone: '',
  weightKg: '',
  heightCm: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  address: '',
}

function toForm(u: ProfileData): FormState {
  return {
    name: u.name ?? '',
    phone: u.phone ?? '',
    weightKg: u.weightKg != null ? String(u.weightKg) : '',
    heightCm: u.heightCm != null ? String(u.heightCm) : '',
    emergencyContactName: u.emergencyContactName ?? '',
    emergencyContactPhone: u.emergencyContactPhone ?? '',
    address: u.address ?? '',
  }
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    let cancelled = false
    fetch('/api/dashboard/profile')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Failed to load'))))
      .then((d) => {
        if (!cancelled && d?.user) {
          setProfile(d.user)
          setForm(toForm(d.user))
        }
      })
      .catch(() => toast.error('Could not load your profile'))
      .finally(() => !cancelled && setIsLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  const setField = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (form.name.trim().length < 2) {
      toast.error('Name must be at least 2 characters')
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        const details = data?.details as Record<string, string[]> | undefined
        const firstError = details ? Object.values(details)[0]?.[0] : undefined
        throw new Error(firstError || data.error || 'Failed to update profile')
      }

      setProfile(data.user)
      await update({ name: data.user.name })
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gym-primary" aria-label="Loading profile" />
      </div>
    )
  }

  const roleLabel = profile?.role === 'ADMIN' ? 'Admin' : profile?.role === 'TRAINER' ? 'Trainer' : 'Member'

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="heading-2 text-gym-text">Profile</h1>
          <p className="text-gym-text-muted mt-1">Manage your account settings</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-gym-surface border-gym-border">
          <CardHeader className="flex flex-row items-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-gym-primary to-gym-secondary flex items-center justify-center font-heading text-3xl font-bold text-white">
                {(profile?.name || session?.user?.name)?.charAt(0).toUpperCase() || 'U'}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 p-2 rounded-full bg-gym-primary text-white hover:bg-gym-primary-dim transition-colors cursor-pointer">
                  <Camera className="h-5 w-5" />
                  <input type="file" className="sr-only" accept="image/*" />
                </label>
              )}
            </div>
            <div className="ml-6 flex-1">
              <h2 className="text-2xl font-bold text-gym-text">{profile?.name || 'Member'}</h2>
              <p className="text-gym-text-muted">{profile?.email || session?.user?.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gym-primary/10 text-gym-primary">
                  {roleLabel}
                </span>
                {profile?.memberId && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gym-secondary/10 text-gym-secondary font-mono">
                    {profile.memberId}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant={isEditing ? 'default' : 'outline'}
              onClick={() => {
                if (!isEditing && profile) setForm(toForm(profile))
                setIsEditing(!isEditing)
              }}
              disabled={isSaving}
            >
              {isEditing ? 'Cancel' : <><UserIcon className="mr-2 h-4 w-4" /> Edit Profile</>}
            </Button>
          </CardHeader>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-gym-surface border-gym-border">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your contact details and fitness metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSave()
              }}
              className="space-y-5"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={form.name} onChange={(e) => setField('name', e.target.value)} disabled={!isEditing || isSaving} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gym-text-muted" aria-hidden="true" />
                    <Input id="email" type="email" value={profile?.email ?? ''} disabled className="pl-10 opacity-70" />
                  </div>
                  <p className="text-xs text-gym-text-muted">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gym-text-muted" aria-hidden="true" />
                    <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" className="pl-10" value={form.phone} onChange={(e) => setField('phone', e.target.value)} disabled={!isEditing || isSaving} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weightKg">Weight (kg)</Label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gym-text-muted" aria-hidden="true" />
                    <Input id="weightKg" type="number" step="0.1" min="0" max="500" placeholder="75" className="pl-10" value={form.weightKg} onChange={(e) => setField('weightKg', e.target.value)} disabled={!isEditing || isSaving} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heightCm">Height (cm)</Label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gym-text-muted" aria-hidden="true" />
                    <Input id="heightCm" type="number" step="0.1" min="0" max="300" placeholder="180" className="pl-10" value={form.heightCm} onChange={(e) => setField('heightCm', e.target.value)} disabled={!isEditing || isSaving} />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gym-text-muted" aria-hidden="true" />
                    <Input id="address" placeholder="Street, City, State, ZIP" className="pl-10" value={form.address} onChange={(e) => setField('address', e.target.value)} disabled={!isEditing || isSaving} />
                  </div>
                </div>
              </div>

              <div className="border-t border-gym-border pt-5 space-y-5">
                <p className="flex items-center gap-2 text-sm font-medium text-gym-text-muted">
                  <HeartPulse className="h-4 w-4 text-gym-accent" aria-hidden="true" />
                  Emergency Contact
                </p>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Contact Name</Label>
                    <Input id="emergencyContactName" placeholder="Jane Doe" value={form.emergencyContactName} onChange={(e) => setField('emergencyContactName', e.target.value)} disabled={!isEditing || isSaving} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                    <Input id="emergencyContactPhone" type="tel" placeholder="+1 (555) 987-6543" value={form.emergencyContactPhone} onChange={(e) => setField('emergencyContactPhone', e.target.value)} disabled={!isEditing || isSaving} />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (profile) setForm(toForm(profile))
                      setIsEditing(false)
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-gym-surface border-gym-border">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Dumbbell className="h-5 w-5 text-gym-primary" aria-hidden="true" />
              <span>Preferences</span>
            </CardTitle>
            <CardDescription>Manage your notification settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { title: 'Email Notifications', desc: 'Receive workout reminders and updates' },
              { title: 'Push Notifications', desc: 'Get notified on your device' },
              { title: 'Weekly Progress Report', desc: 'Receive a summary every Monday' },
            ].map((pref) => (
              <div key={pref.title} className="flex items-center justify-between py-3 border-b border-gym-border last:border-b-0">
                <div>
                  <p className="font-medium text-gym-text">{pref.title}</p>
                  <p className="text-sm text-gym-text-muted">{pref.desc}</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 rounded border-gym-border bg-gym-surface text-gym-primary focus:ring-gym-primary"
                  aria-label={pref.title}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}