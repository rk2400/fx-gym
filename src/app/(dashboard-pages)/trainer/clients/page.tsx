'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, TrendingUp, Target, Clock, Dumbbell, ArrowRight, Calendar, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatRelativeTime } from '@/lib/utils'

interface Client {
  id: string
  name: string
  email: string
  memberId: string
  membership: {
    id: string
    pricingPack: { name: string }
    status: string
    endDate: string
  } | null
  assignedTrainerId: string
  _count: { checkins: number }
  lastCheckin: string | null
  goals: string | null
  progress: {
    weight?: number
    bodyFat?: number
    muscleMass?: number
  }
}

export default function TrainerClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const fetchClients = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/trainer/clients?${params}`)
      const data = await res.json()
      
      if (res.ok) {
        setClients(data.clients)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [search, statusFilter])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getProgressPercent = (client: Client) => {
    if (!client.goals) return 0
    // Mock progress calculation
    return Math.min(100, Math.floor(Math.random() * 100))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/10 text-green-500'
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500'
      case 'EXPIRED': return 'bg-red-500/10 text-red-500'
      default: return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="heading-2 text-gym-text flex items-center space-x-2">
            <UserCog className="h-7 w-7 text-gym-secondary" />
            <span>My Clients</span>
          </h1>
          <p className="text-gym-text-muted mt-1">Manage and track your assigned clients</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-4"
      >
        <StatCard label="Total Clients" value={clients.length} icon={Users} color="from-gym-primary to-green-600" />
        <StatCard label="Active Plans" value={clients.filter(c => c.membership?.status === 'ACTIVE').length} icon={Target} color="from-gym-secondary to-blue-600" />
        <StatCard label="Check-ins Today" value={clients.filter(c => c.lastCheckin && new Date(c.lastCheckin).toDateString() === new Date().toDateString()).length} icon={Clock} color="from-orange-500 to-red-500" />
        <StatCard label="Avg Progress" value={`${clients.reduce((acc, c) => acc + getProgressPercent(c), 0) / (clients.length || 1)}%`} icon={TrendingUp} color="from-purple-500 to-gym-secondary" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gym-text-muted" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); fetchClients(); }} className="input-field w-48">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gym-surface border-gym-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gym-border bg-gym-bg/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Member ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Membership</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Last Check-in</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Total Visits</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Membership Ends</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gym-text-muted uppercase tracking-wider pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gym-border/50">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gym-primary" />
                      </div>
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gym-text-muted">No clients assigned</td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="hover:bg-gym-bg/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gym-text">{client.name}</p>
                          <p className="text-sm text-gym-text-muted">{client.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gym-text-muted">{client.memberId}</td>
                      <td className="px-4 py-3">
                        {client.membership ? (
                          <Badge className={getStatusColor(client.membership.status)}>
                            {client.membership.pricingPack.name}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">No Plan</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-32">
                          <Progress value={getProgressPercent(client)} className="h-2" />
                          <p className="text-xs text-gym-text-muted mt-1">{getProgressPercent(client)}% to goal</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gym-text-muted">
                        {client.lastCheckin ? formatRelativeTime(client.lastCheckin) : 'Never'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gym-text-muted">{client._count.checkins}</td>
                      <td className="px-4 py-3 text-sm text-gym-text-muted">
                        {client.membership ? formatDate(client.membership.endDate) : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right pr-4">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedClient(client); setDetailDialogOpen(true); }}>
                          <ArrowRight className="h-4 w-4" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gym-surface border border-gym-border"
    >
      <div className="flex items-start justify-between">
        <div className="p-3 rounded-xl bg-gradient-to-br {color}">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="mt-4">
        <p className="font-heading text-3xl font-bold text-gym-text">{value}</p>
        <p className="text-sm text-gym-text-muted mt-1">{label}</p>
      </div>
    </motion.div>
  )
}

function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('w-full bg-gym-border rounded-full overflow-hidden', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="h-full bg-gradient-to-r from-gym-primary to-gym-secondary rounded-full"
      />
    </div>
  )
}

import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserCog } from 'lucide-react'