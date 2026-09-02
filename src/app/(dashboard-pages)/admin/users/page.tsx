'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, UserPlus, ChevronRight, MoreVertical, Edit, Trash2, Shield, UserCog, User, Mail, Calendar, Activity, RefreshCw, Loader2, Phone, MapPin, Scale, Ruler, ShieldCheck, Clock, CreditCard, HeartPulse, Eye, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import Link from 'next/link'
import { formatPrice, cn } from '@/lib/utils'

interface CurrentMembership {
  id: string
  startDate: string
  endDate: string
  pricingPack: { id: string; name: string; price: number | string }
}

interface User {
  id: string
  email: string
  name: string | null
  role: string
  memberId: string | null
  emailVerified: string | null
  isActive: boolean
  lastLogin: string | null
  createdAt: string
  assignedTrainerId: string | null
  assignedTrainer: { id: string; name: string; email: string } | null
  memberships: CurrentMembership[]
  _count: { memberships: number; checkins: number }
}

interface PricingPackOption {
  id: string
  name: string
  price: number | string
  duration: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}
interface MembershipHistory {
  id: string
  status: string
  startDate: string
  endDate: string
  pricingPack: { id: string; name: string; price: number | string; duration: number; description: string | null }
}

interface CheckinRecord {
  id: string
  checkedIn: string
  checkedOut: string | null
  type: string | null
}

interface UserDetails extends User {
  image: string | null
  phone: string | null
  weightKg: number | null
  heightCm: number | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  address: string | null
  memberships: MembershipHistory[]
  checkins: CheckinRecord[]
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [planTarget, setPlanTarget] = useState<User | null>(null)
  const [packs, setPacks] = useState<PricingPackOption[]>([])
  const [selectedPackId, setSelectedPackId] = useState('')
  const [changingPlan, setChangingPlan] = useState(false)
const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [details, setDetails] = useState<UserDetails | null>(null)
  const [busyUserId, setBusyUserId] = useState<string | null>(null)

  const openPlanDialog = async (user: User) => {
    setPlanTarget(user)
    setSelectedPackId(user.memberships?.[0]?.pricingPack.id || '')
    setPlanDialogOpen(true)
    if (packs.length === 0) {
      try {
        const res = await fetch('/api/pricing')
        const data = await res.json()
        if (Array.isArray(data)) {
          setPacks(data.map((p: any) => ({ id: p.id, name: p.name, price: p.price, duration: p.duration })))
        }
      } catch {
        toast.error('Failed to load plans')
      }
    }
  }
const openDetails = async (user: User) => {
    setSelectedUser(user)
    setDetails(null)
    setDetailsOpen(true)
    setDetailsLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`)
      const data = await res.json()
      if (res.ok) {
        setDetails(data.user)
      } else {
        toast.error(data.error || 'Failed to load user details')
      }
    } catch {
      toast.error('Failed to load user details')
    } finally {
      setDetailsLoading(false)
    }
  }

  const handlePlanChange = async () => {
    if (!planTarget || !selectedPackId) {
      toast.error('Select a plan first')
      return
    }
    setChangingPlan(true)
    try {
      const res = await fetch(`/api/admin/users/${planTarget.id}/membership`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricingPackId: selectedPackId }),
      })
      const data = await res.json()

      if (res.ok) {
        const m = data.membership
        toast.success(
          `${m.planName} assigned to ${planTarget.name || planTarget.email}. Active until ${new Date(m.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.`
        )
        setPlanDialogOpen(false)
        fetchUsers()
      } else {
        toast.error(data.error || 'Failed to update membership')
      }
    } catch {
      toast.error('Failed to update membership')
    } finally {
      setChangingPlan(false)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      if (search) params.append('search', search)
      if (roleFilter) params.append('role', roleFilter)
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      
      if (res.ok) {
        setUsers(data.users)
        setPagination(data.pagination)
      } else {
        toast.error(data.error || 'Failed to fetch users')
      }
    } catch (error) {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, search, roleFilter, statusFilter])

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (busyUserId) return
    setBusyUserId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      
      if (res.ok) {
        toast.success(`Role updated to ${newRole.charAt(0) + newRole.slice(1).toLowerCase()}`)
        fetchUsers()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to update role')
      }
    } catch (error) {
      toast.error('Failed to update role')
    } finally {
      setBusyUserId(null)
    }
  }

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    if (busyUserId) return
    setBusyUserId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      
      if (res.ok) {
        if (isActive) {
          toast.success('User activated — they can sign in again')
        } else {
          toast.success('User deactivated — they have been signed out everywhere')
        }
        fetchUsers()
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setBusyUserId(null)
    }
  }

  const handleDelete = async (userId: string) => {
    if (busyUserId) return
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    setBusyUserId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        toast.success('User deleted', {
          description: 'Their data has been permanently removed from the system.',
        })
        fetchUsers()
      } else {
        toast.error('Failed to delete user')
      }
    } catch (error) {
      toast.error('Failed to delete user')
    } finally {
      setBusyUserId(null)
    }
  }

  const handleResetPassword = async (userId: string, email: string) => {
    if (!confirm(`Send a password reset link to ${email}?`)) return
    setBusyUserId(userId)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Password reset instructions sent to ${email}`)
      } else {
        toast.error(data.error || 'Failed to send reset instructions')
      }
    } catch {
      toast.error('Something went wrong – please try again')
    } finally {
      setBusyUserId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (user: User) => {
    if (!user.emailVerified) return <Badge variant="warning">Unverified</Badge>
    if (!user.isActive) return <Badge variant="secondary">Inactive</Badge>
    return <Badge variant="success">Active</Badge>
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="heading-2 text-gym-text">User Management</h1>
          <p className="text-gym-text-muted mt-1">Manage all users, roles, and permissions</p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
            Add New User
          </Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gym-text-muted" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); fetchUsers(); }} className="input-field w-40">
            <option value="">All Roles</option>
            <option value="MEMBER">Member</option>
            <option value="TRAINER">Trainer</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); fetchUsers(); }} className="input-field w-40">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gym-surface border-gym-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gym-border bg-gym-bg/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Current Plan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Member ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Trainer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Memberships</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Check-ins</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Last Login</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gym-text-muted uppercase tracking-wider pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gym-border/50">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gym-text-muted">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gym-primary" />
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gym-text-muted">No users found</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gym-bg/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gym-text">{user.name || 'Unnamed'}</p>
                          <p className="text-sm text-gym-text-muted">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <span className={cn(
                              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer',
                              user.role === 'ADMIN' && 'bg-gym-accent/10 text-gym-accent',
                              user.role === 'TRAINER' && 'bg-gym-secondary/10 text-gym-secondary',
                              user.role === 'MEMBER' && 'bg-gym-primary/10 text-gym-primary'
                            )}>
                              {user.role}
                              <ChevronRight className="ml-1 h-3 w-3" />
                            </span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {busyUserId === user.id && (
                              <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-gym-text-muted">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-gym-primary" />
                                Working…
                              </div>
                            )}
                            <DropdownMenuItem 
                              className={user.role === 'MEMBER' ? 'bg-gym-primary/10 text-gym-primary' : ''}
                              onClick={() => handleRoleChange(user.id, 'MEMBER')}
                              disabled={busyUserId === user.id}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Member
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className={user.role === 'TRAINER' ? 'bg-gym-secondary/10 text-gym-secondary' : ''}
                              onClick={() => handleRoleChange(user.id, 'TRAINER')}
                              disabled={busyUserId === user.id}
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              Trainer
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className={user.role === 'ADMIN' ? 'bg-gym-accent/10 text-gym-accent' : ''}
                              onClick={() => handleRoleChange(user.id, 'ADMIN')}
                              disabled={busyUserId === user.id}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      <td className="px-4 py-3">
                        {user.memberships?.[0] ? (
                          <div>
                            <p className="text-sm font-medium text-gym-text">{user.memberships[0].pricingPack.name}</p>
                            <p className="text-xs text-gym-text-muted">
                              till {formatDate(user.memberships[0].endDate)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gym-text-muted">No plan</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gym-text-muted">{user.memberId || 'N/A'}</td>
                      <td className="px-4 py-3">{getStatusBadge(user)}</td>
                      <td className="px-4 py-3 text-sm text-gym-text-muted">
                        {user.assignedTrainer ? user.assignedTrainer.name : 'Unassigned'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gym-text-muted">{user._count.memberships}</td>
                      <td className="px-4 py-3 text-sm text-gym-text-muted">{user._count.checkins}</td>
                      <td className="px-4 py-3 text-sm text-gym-text-muted">
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gym-text-muted">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3 text-right pr-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 text-gym-text-muted hover:text-gym-text hover:bg-gym-bg rounded-lg transition-colors">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openPlanDialog(user)}>
                              <RefreshCw className="h-4 w-4" />
                              Change Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDetails(user)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user.id, !user.isActive)}
                              className={user.isActive ? 'text-gym-accent' : 'text-green-500'}
                              disabled={busyUserId === user.id}
                            >
                              {busyUserId === user.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Activity className="mr-2 h-4 w-4" />
                              )}
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-gym-accent" disabled={busyUserId === user.id}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gym-border">
              <p className="text-sm text-gym-text-muted">
                Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))} disabled={pagination.page === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))} disabled={pagination.page === pagination.totalPages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Change Membership Plan Dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="bg-gym-surface border-gym-border max-w-md">
          <DialogHeader>
            <DialogTitle>Change Membership Plan</DialogTitle>
            <DialogDescription>
              Assign a new plan to the selected member. It starts today and any previous active plan is cancelled.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {planTarget && (
              <p className="text-sm text-gym-text-muted">
                Member: <span className="font-medium text-gym-text">{planTarget.name || planTarget.email}</span>
                {planTarget.memberships[0] && (<span> | Current: {planTarget.memberships[0].pricingPack.name}</span>)}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="newPlan">New Plan</Label>
              <select id="newPlan" value={selectedPackId} onChange={(e) => setSelectedPackId(e.target.value)} className="input-field w-full" disabled={changingPlan}>
                <option value="">Select a plan...</option>
                {packs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {formatPrice(typeof p.price === 'string' ? parseFloat(p.price) : p.price)} / {p.duration} days
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)} disabled={changingPlan}>
              Cancel
            </Button>
            <Button onClick={handlePlanChange} disabled={changingPlan || !selectedPackId}>
              {changingPlan ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>Assign Plan</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
{/* User Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-gym-surface border-gym-border max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Full profile, emergency contact, membership and check-in history</DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gym-primary" />
              <p className="text-sm text-gym-text-muted">Loading user details…</p>
            </div>
          ) : !details ? (
            <p className="py-10 text-center text-sm text-gym-text-muted">No details available for this user.</p>
          ) : (
            <div className="space-y-6">
              {/* Identity header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {details.image ? (
                  <img
                    src={details.image}
                    alt={details.name || 'User'}
                    className="h-20 w-20 rounded-full object-cover border-2 border-gym-primary/40"
                  />
                ) : (
                  <div className="h-20 w-20 shrink-0 rounded-full bg-gradient-to-br from-gym-primary to-gym-secondary flex items-center justify-center font-heading text-3xl font-bold text-white">
                    {(details.name || details.email).charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-gym-text">{details.name || 'Unnamed'}</h3>
                  <p className="text-sm text-gym-text-muted truncate">{details.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant={details.role === 'ADMIN' ? 'destructive' : details.role === 'TRAINER' ? 'default' : 'outline'}>{details.role}</Badge>
                    <Badge variant={details.isActive ? 'success' : 'secondary'}>{details.isActive ? 'Active' : 'Inactive'}</Badge>
                    {details.emailVerified ? <Badge variant="success">Verified</Badge> : <Badge variant="warning">Unverified</Badge>}
                    {details.memberId && <Badge variant="outline" className="font-mono">{details.memberId}</Badge>}
                  </div>
                </div>
              </div>

              {/* Contact & physique */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <InfoTile icon={Mail} label="Email" value={details.email} />
                <InfoTile icon={Phone} label="Phone" value={details.phone ? `+91 ${details.phone}` : '—'} />
                <InfoTile icon={MapPin} label="Address" value={details.address || '—'} />
                <InfoTile icon={Scale} label="Weight" value={details.weightKg ? `${details.weightKg} kg` : '—'} />
                <InfoTile icon={Ruler} label="Height" value={details.heightCm ? `${details.heightCm} cm` : '—'} />
                <InfoTile icon={ShieldCheck} label="Role" value={details.role} />
                <InfoTile icon={Calendar} label="Joined" value={formatDate(details.createdAt)} />
                <InfoTile icon={Clock} label="Last Login" value={details.lastLogin ? formatDate(details.lastLogin) : 'Never'} />
                <InfoTile icon={User} label="Assigned Trainer" value={details.assignedTrainer?.name || 'Unassigned'} />
              </div>
{/* Emergency contact */}
              <div className="rounded-xl border border-gym-accent/25 bg-gym-accent/5 p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-gym-text-muted mb-3">
                  <HeartPulse className="h-4 w-4 text-gym-accent" />
                  Emergency Contact
                </p>
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <InfoTile icon={User} label="Name" value={details.emergencyContactName || '—'} />
                  <InfoTile icon={Phone} label="Phone" value={details.emergencyContactPhone ? `+91 ${details.emergencyContactPhone}` : '—'} />
                </div>
              </div>

              {/* Membership history */}
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-gym-text-muted mb-3">
                  <CreditCard className="h-4 w-4 text-gym-primary" />
                  Memberships
                </p>
                {details.memberships.length === 0 ? (
                  <p className="text-sm text-gym-text-muted">No memberships yet.</p>
                ) : (
                  <div className="space-y-2">
                    {details.memberships.map((m) => (
                      <div
                        key={m.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-gym-border bg-gym-bg/50 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-gym-text">{m.pricingPack.name}</p>
                          <p className="text-xs text-gym-text-muted">
                            {formatDate(m.startDate)} → {formatDate(m.endDate)}
                            {typeof m.pricingPack.price !== 'undefined' && m.pricingPack.id && (
                              <span className="ml-1">· {formatPrice(m.pricingPack.price)}</span>
                            )}
                            {m.pricingPack.duration ? <span className="ml-1">· {m.pricingPack.duration} days</span> : null}
                          </p>
                        </div>
                        <Badge
                          variant={
                            m.status === 'ACTIVE'
                              ? 'success'
                              : m.status === 'CANCELLED'
                                ? 'secondary'
                                : m.status === 'EXPIRED'
                                  ? 'secondary'
                                  : 'warning'
                          }
                        >
                          {m.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Check-ins / workouts */}
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-gym-text-muted mb-3">
                  <Activity className="h-4 w-4 text-gym-primary" />
                  Check-ins / Workouts
                  <span className="font-normal text-gym-text-muted/70">({details.checkins.length} shown)</span>
                </p>
                {details.checkins.length === 0 ? (
                  <p className="text-sm text-gym-text-muted">No check-ins recorded yet.</p>
                ) : (
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                    {details.checkins.map((c) => (
                      <div key={c.id} className="flex items-center justify-between rounded-lg border border-gym-border bg-gym-bg/50 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-gym-text">{workoutLabel(c.type)}</p>
                          <p className="text-xs text-gym-text-muted">
                            {formatDate(c.checkedIn)} ·{' '}
                            {new Date(c.checkedIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-xs text-gym-text-muted">
                          {c.checkedOut
                            ? `${Math.max(0, Math.round((new Date(c.checkedOut).getTime() - new Date(c.checkedIn).getTime()) / 60000))} min`
                            : 'In session'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (details) openPlanDialog(details)
                  }}
                  disabled={!details}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  Assign Trainer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (details) handleResetPassword(details.id, details.email)
                  }}
                  disabled={!details || busyUserId === details.id}
                >
                  {busyUserId === details?.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="mr-2 h-4 w-4" />
                  )}
                  Reset Password
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}




function InfoTile({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-gym-border bg-gym-bg/50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gym-text-muted uppercase tracking-wider mb-0.5">
        <Icon className="h-3.5 w-3.5 text-gym-primary shrink-0" />
        {label}
      </div>
      <p className="text-sm text-gym-text break-words">{value}</p>
    </div>
  )
}

function workoutLabel(type: string | null): string {
  const map: Record<string, string> = {
    strength: 'Strength Training',
    hiit: 'HIIT / Cardio',
    functional: 'Functional Training',
    sports: 'Sports Performance',
    recovery: 'Recovery / Mobility',
    other: 'Other',
  }
  return map[type || 'other'] || 'Workout'
}
