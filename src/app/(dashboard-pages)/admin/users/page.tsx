'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, UserPlus, ChevronRight, MoreVertical, Edit, Trash2, Shield, UserCog, User, Mail, Calendar, Activity, RefreshCw, Loader2 } from 'lucide-react'
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
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      
      if (res.ok) {
        toast.success('Role updated successfully')
        fetchUsers()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to update role')
      }
    } catch (error) {
      toast.error('Failed to update role')
    }
  }

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      
      if (res.ok) {
        toast.success(`User ${isActive ? 'activated' : 'deactivated'}`)
        fetchUsers()
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        toast.success('User deleted')
        fetchUsers()
      } else {
        toast.error('Failed to delete user')
      }
    } catch (error) {
      toast.error('Failed to delete user')
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
                            <DropdownMenuItem 
                              className={user.role === 'MEMBER' ? 'bg-gym-primary/10 text-gym-primary' : ''}
                              onClick={() => handleRoleChange(user.id, 'MEMBER')}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Member
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className={user.role === 'TRAINER' ? 'bg-gym-secondary/10 text-gym-secondary' : ''}
                              onClick={() => handleRoleChange(user.id, 'TRAINER')}
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              Trainer
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className={user.role === 'ADMIN' ? 'bg-gym-accent/10 text-gym-accent' : ''}
                              onClick={() => handleRoleChange(user.id, 'ADMIN')}
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
<DropdownMenuItem onClick={() => setSelectedUser(user)}>
                              <Mail className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user.id, !user.isActive)}
                              className={user.isActive ? 'text-gym-accent' : 'text-green-500'}
                            >
                              <Activity className="mr-2 h-4 w-4" />
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-gym-accent">
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
'Assign Plan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




