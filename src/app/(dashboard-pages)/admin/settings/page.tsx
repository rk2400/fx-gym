'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Building2, Loader2, Percent, Phone, Receipt, Save, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'

type SettingsForm = {
  name: string
  legalName: string
  tagline: string
  addressLine1: string
  addressLine2: string
  phone: string
  email: string
  website: string
  gstEnabled: boolean
  gstin: string
  sac: string
  gstRatePct: number
  gstMode: 'CGST_SGST' | 'IGST'
  placeOfSupply: string
  upiId: string
  invoiceFooterNote: string
  invoiceTerms: string
}

const EMPTY: SettingsForm = {
  name: '',
  legalName: '',
  tagline: '',
  addressLine1: '',
  addressLine2: '',
  phone: '',
  email: '',
  website: '',
  gstEnabled: true,
  gstin: '',
  sac: '',
  gstRatePct: 18,
  gstMode: 'CGST_SGST',
  placeOfSupply: '',
  upiId: '',
  invoiceFooterNote: '',
  invoiceTerms: '',
}

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-gym-text">{label}</Label>
      {children}
      {hint && <p className="text-xs text-gym-text-muted">{hint}</p>}
    </div>
  )
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/admin/settings', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load settings')
        const json = await res.json()
        if (!cancelled) {
          setForm({ ...EMPTY, ...json.settings })
          setUpdatedAt(json.updatedAt)
        }
      } catch {
        if (!cancelled) toast.error('Could not load settings')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const set = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(json?.error || 'Failed to save settings')
        return
      }
      setForm({ ...EMPTY, ...json.settings })
      toast.success('Settings saved — new invoices use this profile')
    } catch {
      toast.error('Network error — settings not saved')
    } finally {
      setSaving(false)
    }
  }

  const footerAddress = [form.addressLine1, form.addressLine2].filter(Boolean).join(', ')
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="heading-2 text-gym-text">Settings</h1>
        <p className="text-gym-text-muted mt-1">
          Gym profile printed on invoices — header, footer, GST &amp; payment details
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Business identity */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gym-surface border-gym-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gym-text">
                  <Building2 className="h-5 w-5 text-gym-primary" aria-hidden="true" />
                  Business Identity
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="Gym Name">
                  <Input value={form.name} onChange={(e) => set('name', e.target.value)} className="bg-gym-bg border-gym-border text-gym-text" />
                </Field>
                <Field label="Legal Entity">
                  <Input value={form.legalName} onChange={(e) => set('legalName', e.target.value)} className="bg-gym-bg border-gym-border text-gym-text" />
                </Field>
                <Field label="Tagline">
                  <Input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} className="bg-gym-bg border-gym-border text-gym-text" />
                </Field>
                <Field label="Address Line 1">
                  <Input value={form.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} className="bg-gym-bg border-gym-border text-gym-text" />
                </Field>
                <Field label="Address Line 2">
                  <Input value={form.addressLine2} onChange={(e) => set('addressLine2', e.target.value)} className="bg-gym-bg border-gym-border text-gym-text" />
                </Field>
                <Field label="Phone">
                  <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="bg-gym-bg border-gym-border text-gym-text" />
                </Field>
                <Field label="Billing Email">
                  <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="bg-gym-bg border-gym-border text-gym-text" />
                </Field>
                <Field label="Website">
                  <Input value={form.website} onChange={(e) => set('website', e.target.value)} className="bg-gym-bg border-gym-border text-gym-text" />
                </Field>
              </CardContent>
            </Card>
          </motion.div>

          {/* GST */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="bg-gym-surface border-gym-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gym-text">
                  <Percent className="h-5 w-5 text-gym-primary" aria-hidden="true" />
                  Tax (GST)
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Field label="GST Applicable">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.gstEnabled}
                    onClick={() => set('gstEnabled', !form.gstEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.gstEnabled ? 'bg-gym-primary' : 'bg-gym-border'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.gstEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </Field>
                <Field label="GST Rate (%)">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.gstRatePct}
                    disabled={!form.gstEnabled}
                    onChange={(e) => set('gstRatePct', Number(e.target.value))}
                    className="bg-gym-bg border-gym-border text-gym-text disabled:opacity-50"
                  />
                </Field>
                <Field label="GSTIN" hint="15-character GST identification number">
                  <Input
                    value={form.gstin}
                    maxLength={15}
                    disabled={!form.gstEnabled}
                    onChange={(e) => set('gstin', e.target.value.toUpperCase())}
                    className="bg-gym-bg border-gym-border text-gym-text uppercase disabled:opacity-50"
                  />
                </Field>
                <Field label="SAC Code" hint="e.g. 999723 — physical well-being services">
                  <Input value={form.sac} disabled={!form.gstEnabled} onChange={(e) => set('sac', e.target.value)} className="bg-gym-bg border-gym-border text-gym-text disabled:opacity-50" />
                </Field>
                <Field label="Breakup Mode" hint="CGST+SGST within state, IGST for inter-state">
                  <select
                    value={form.gstMode}
                    disabled={!form.gstEnabled}
                    onChange={(e) => set('gstMode', e.target.value as SettingsForm['gstMode'])}
                    className="h-10 w-full rounded-md border border-gym-border bg-gym-bg px-3 text-sm text-gym-text disabled:opacity-50"
                  >
                    <option value="CGST_SGST">CGST + SGST (intra-state)</option>
                    <option value="IGST">IGST (inter-state)</option>
                  </select>
                </Field>
                <Field label="Place of Supply">
                  <Input value={form.placeOfSupply} disabled={!form.gstEnabled} onChange={(e) => set('placeOfSupply', e.target.value)} className="bg-gym-bg border-gym-border text-gym-text disabled:opacity-50" />
                </Field>
              </CardContent>
            </Card>
          </motion.div>

          {/* Invoice footer & payments */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gym-surface border-gym-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gym-text">
                  <Receipt className="h-5 w-5 text-gym-primary" aria-hidden="true" />
                  Invoice Footer &amp; Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Field label="UPI ID (shown on unpaid invoices)">
                  <Input value={form.upiId} onChange={(e) => set('upiId', e.target.value)} placeholder="gym@upi" className="bg-gym-bg border-gym-border text-gym-text" />
                </Field>
                <Field label="Footer Note">
                  <Input value={form.invoiceFooterNote} onChange={(e) => set('invoiceFooterNote', e.target.value)} className="bg-gym-bg border-gym-border text-gym-text" />
                </Field>
                <Field label="Terms (one per line)">
                  <Textarea rows={4} value={form.invoiceTerms} onChange={(e) => set('invoiceTerms', e.target.value)} className="bg-gym-bg border-gym-border text-gym-text" />
                </Field>

                {/* Live footer preview — mirrors the printed footer band */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
                  <p className="text-[11px] font-semibold text-gray-500">
                    {[form.legalName, form.gstEnabled && form.gstin && `GSTIN ${form.gstin}`, form.gstEnabled && form.sac && `SAC ${form.sac}`]
                      .filter(Boolean)
                      .join('  ·  ')}
                    {form.website && <span className="float-right font-normal">{form.website}</span>}
                  </p>
                  {footerAddress && <p className="mt-1.5 text-[10px] text-gray-400">{footerAddress}</p>}
                  <p className="mt-1 text-[10px] text-gray-400">
                    <Phone className="mr-1 inline h-3 w-3" aria-hidden="true" />
                    {form.phone} · {form.email}
                  </p>
                  <p className="mt-1 text-[10px] text-gray-400">{form.invoiceFooterNote}</p>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-gym-text-muted">
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  Preview above shows exactly how the invoice footer will print.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex items-center justify-between pb-4">
            <p className="text-xs text-gym-text-muted">
              {updatedAt ? `Last saved ${new Date(updatedAt).toLocaleString('en-IN')}` : 'Using built-in defaults — save to customise'}
            </p>
            <Button onClick={save} disabled={saving} className="min-w-36">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="mr-2 h-4 w-4" aria-hidden="true" />}
              {saving ? 'Saving…' : 'Save Settings'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}


