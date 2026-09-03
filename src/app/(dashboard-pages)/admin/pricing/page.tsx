'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Tag, Loader2, Plus, Power, Save, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'

interface AdminPack {
  id: string; name: string; slug: string; description: string | null
  price: number | string; duration: number; features: string[]
  isPopular: boolean; isActive: boolean; sortOrder: number
  _count?: { memberships: number }
}
interface DraftState {
  name: string; description: string; price: string; duration: string
  features: string; isPopular: boolean; isActive: boolean; sortOrder: string
}

const emptyNew: DraftState = { name: '', description: '', price: '', duration: '30', features: '', isPopular: false, isActive: true, sortOrder: '10' }

function toDraft(p: AdminPack): DraftState {
  return {
    name: p.name, description: p.description ?? '', price: String(p.price), duration: String(p.duration),
    features: (p.features || []).join('\n'), isPopular: p.isPopular, isActive: p.isActive, sortOrder: String(p.sortOrder),
  }
}

// Module-level form fields — MUST live outside the page component.
// If defined inline, every keystroke re-creates the component type and React
// remounts the inputs, which makes the cursor jump out of the field.
function PackFields({ d, onPatch }: { d: DraftState; onPatch: (patch: Partial<DraftState>) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Plan name</Label>
          <Input value={d.name} onChange={(e) => onPatch({ name: e.target.value })} placeholder="Monthly Membership" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Price (Rs)</Label>
            <Input type="number" min="0" value={d.price} onChange={(e) => onPatch({ price: e.target.value })} placeholder="3000" />
          </div>
          <div className="space-y-2">
            <Label>Duration (days)</Label>
            <Input type="number" min="1" value={d.duration} onChange={(e) => onPatch({ duration: e.target.value })} placeholder="30" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input value={d.description} onChange={(e) => onPatch({ description: e.target.value })} placeholder="Short marketing line shown under the plan" />
      </div>
      <div className="space-y-2">
        <Label>Features (one per line)</Label>
        <textarea
          className="input-field min-h-[100px]"
          value={d.features}
          onChange={(e) => onPatch({ features: e.target.value })}
          placeholder={'24/7 Gym Access\nAll Group Classes'}
        />
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-gym-text">
          <input type="checkbox" checked={d.isActive} onChange={(e) => onPatch({ isActive: e.target.checked })} className="h-4 w-4 rounded border-gym-border bg-gym-surface text-gym-primary focus:ring-gym-primary" />
          Active (visible on pricing page)
        </label>
        <label className="flex items-center gap-2 text-sm text-gym-text">
          <input type="checkbox" checked={d.isPopular} onChange={(e) => onPatch({ isPopular: e.target.checked })} className="h-4 w-4 rounded border-gym-border bg-gym-surface text-gym-primary focus:ring-gym-primary" />
          Mark as popular
        </label>
        <div className="flex items-center gap-2 text-sm text-gym-text-muted">
          Sort order
          <Input type="number" className="w-20" value={d.sortOrder} onChange={(e) => onPatch({ sortOrder: e.target.value })} />
        </div>
      </div>
    </div>
  )
}

export default function AdminPricingPage() {
  const [packs, setPacks] = useState<AdminPack[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<DraftState | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newDraft, setNewDraft] = useState<DraftState>(emptyNew)

  const fetchPacks = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pricing')
      const data = await res.json()
      if (res.ok) setPacks(data)
      else toast.error(data.error || 'Failed to load plans')
    } catch { toast.error('Failed to load plans') } finally { setLoading(false) }
  }
  useEffect(() => { fetchPacks() }, [])

  const startEdit = (p: AdminPack) => { setEditingId(p.id); setDraft(toDraft(p)) }
  const cancelEdit = () => { setEditingId(null); setDraft(null) }

  const payloadOf = (d: DraftState) => ({
    name: d.name.trim(), description: d.description.trim() || null,
    price: Number(d.price), duration: Number(d.duration),
    features: d.features.split('\n').map((f) => f.trim()).filter(Boolean),
    isPopular: d.isPopular, isActive: d.isActive, sortOrder: Number(d.sortOrder) || 0,
  })

  const savePack = async (id: string) => {
    if (!draft) return
    if (!draft.name.trim() || !draft.price || !draft.duration) { toast.error('Name, price and duration are required'); return }
    setBusyId(id)
    try {
      const res = await fetch('/api/admin/pricing', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...payloadOf(draft) }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save plan')
      toast.success('Plan updated – pricing pages reflect it immediately.')
      cancelEdit(); fetchPacks()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to save plan') } finally { setBusyId(null) }
  }

  const createPack = async () => {
    if (!newDraft.name.trim() || !newDraft.price || !newDraft.duration) { toast.error('Name, price and duration are required'); return }
    setBusyId('new')
    try {
      const res = await fetch('/api/admin/pricing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadOf(newDraft)) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create plan')
      toast.success('Plan created.')
      setShowNew(false); setNewDraft(emptyNew); fetchPacks()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to create plan') } finally { setBusyId(null) }
  }

  const toggleActive = async (p: AdminPack) => {
    setBusyId(p.id)
    try {
      if (p.isActive) {
        // Hide via PATCH (isActive:false) — DELETE is reserved for actual deletion,
        // so hiding a plan with no members NEVER permanently removes it.
        const res = await fetch('/api/admin/pricing', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: p.id, ...payloadOf(toDraft(p)), isActive: false }),
        })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to hide') }
        toast.success(`"${p.name}" is now hidden from the website`)
      } else {
        const res = await fetch('/api/admin/pricing', { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: p.id, name: p.name, description: p.description, price: Number(p.price), duration: p.duration, features: p.features, isPopular: p.isPopular, isActive: true, sortOrder: p.sortOrder }) })
        if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to activate') }
        toast.success(`"${p.name}" is live again`)
      }
      fetchPacks()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to update plan') } finally { setBusyId(null) }
  }

  const deletePack = async (p: AdminPack) => {
    const totalMembers = p._count?.memberships ?? 0
    const msg = totalMembers === 0
      ? `Permanently delete "${p.name}"? This cannot be undone.`
      : `Delete "${p.name}"? It has ${totalMembers} membership record(s) — it will be hidden from the website instead of permanently removed.`
    if (!confirm(msg)) return
    setBusyId(p.id)
    try {
      const res = await fetch(`/api/admin/pricing?id=${p.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete plan')
      toast.success(
        data.permanent
          ? `"${p.name}" permanently deleted.`
          : `"${p.name}" hidden — it has historical memberships.`
      )
      setPacks((prev) => prev.filter((x) => x.id !== p.id) || prev)
      fetchPacks()
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Failed to delete plan') } finally { setBusyId(null) }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2 text-gym-text">Membership Plans</h1>
          <p className="text-gym-text-muted mt-1">Update prices and details shown across the site</p>
        </div>
        {!showNew && (
          <Button onClick={() => setShowNew(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> New Plan
          </Button>
        )}
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-gym-primary" /></div>
      ) : (
        <>
          {showNew && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-gym-surface border-gym-primary/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Create New Plan
                    <button onClick={() => setShowNew(false)} aria-label="Close"><X className="h-5 w-5 text-gym-text-muted" /></button>
                  </CardTitle>
                  <CardDescription>It will appear on the pricing page as soon as it is active.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PackFields d={newDraft} onPatch={(patch) => setNewDraft((d) => ({ ...d, ...patch }))} />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
                    <Button onClick={createPack} disabled={busyId === 'new'}>
                      {busyId === 'new' ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Plus className="mr-1 h-4 w-4" />Create Plan</>)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {packs.map((p) => (
            editingId === p.id && draft ? (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-gym-surface border-gym-primary/50">
                  <CardHeader>
                    <CardTitle>Edit: {p.name}</CardTitle>
                    <CardDescription>Slug: {p.slug}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <PackFields d={draft} onPatch={(patch) => setDraft((d) => (d ? { ...d, ...patch } : d))} />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={cancelEdit} disabled={busyId === p.id}>Cancel</Button>
                      <Button onClick={() => savePack(p.id)} disabled={busyId === p.id}>
                        {busyId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Save className="mr-1 h-4 w-4" />Save Changes</>)}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={`bg-gym-surface border-gym-border ${!p.isActive ? 'opacity-60' : ''}`}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Tag className="h-5 w-5 text-gym-primary" aria-hidden="true" />
                        {p.name}
                        {p.isPopular && <Badge>Popular</Badge>}
                        {!p.isActive && <Badge variant="secondary">Hidden</Badge>}
                      </CardTitle>
                      <CardDescription className="mt-1">{p.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="font-heading text-3xl font-bold text-gym-text">{formatPrice(p.price)}</p>
                      <p className="text-sm text-gym-text-muted">{p.duration} days · {p._count?.memberships ?? 0} member(s)</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <ul className="text-sm text-gym-text-muted list-disc pl-4 flex-1 min-w-[240px]">
                        {(p.features || []).slice(0, 4).map((f) => (<li key={f}>{f}</li>))}
                        {(p.features || []).length > 4 && <li>+{p.features.length - 4} more…</li>}
                      </ul>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => startEdit(p)}>Edit</Button>
                        <Button
                          variant={p.isActive ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => toggleActive(p)}
                          disabled={busyId === p.id}
                          title={p.isActive ? 'Hide from website' : 'Show on website'}
                        >
                          {busyId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Power className="mr-1 h-4 w-4" />{p.isActive ? 'Hide' : 'Show'}</>)}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deletePack(p)}
                          disabled={busyId === p.id}
                          className="text-gym-accent hover:bg-gym-accent/10"
                          title="Delete plan"
                        >
                          {busyId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          ))}
        </>
      )}
    </div>
  )
}
