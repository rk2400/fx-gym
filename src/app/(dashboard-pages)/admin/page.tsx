'use client'

import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Users, Dumbbell, DollarSign, Tag, TrendingUp, UserPlus, UserCheck, UserX, Clock, BarChart3 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'

const stats = [
  { label: 'Total Members', value: '2,547', icon: Users, color: 'from-gym-primary to-green-600', trend: '+12%', trendIcon: TrendingUp },
  { label: 'Active Trainers', value: '15', icon: Dumbbell, color: 'from-gym-secondary to-blue-600', trend: '+2', trendIcon: UserPlus },
  { label: 'Monthly Revenue', value: '₹92,000', icon: DollarSign, color: 'from-purple-500 to-gym-secondary', trend: '+8%', trendIcon: TrendingUp },
  { label: 'Check-ins Today', value: '342', icon: Clock, color: 'from-orange-500 to-red-500', trend: '+5%', trendIcon: TrendingUp },
]

const recentUsers = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.j@email.com', role: 'MEMBER', memberId: 'FXG-K7X9-A2B4', status: 'active', joined: '2024-01-15' },
  { id: '2', name: 'Mike Chen', email: 'mike.chen@email.com', role: 'MEMBER', memberId: 'FXG-K7X9-C8D2', status: 'active', joined: '2024-01-14' },
  { id: '3', name: 'Emily Davis', email: 'emily.d@email.com', role: 'MEMBER', memberId: 'FXG-K7X9-E5F1', status: 'pending', joined: '2024-01-13' },
  { id: '4', name: 'James Wilson', email: 'james.w@email.com', role: 'TRAINER', memberId: 'FXG-K7X9-G3H7', status: 'active', joined: '2024-01-12' },
  { id: '5', name: 'Lisa Anderson', email: 'lisa.a@email.com', role: 'MEMBER', memberId: 'FXG-K7X9-J9K2', status: 'inactive', joined: '2024-01-11' },
]

const roleDistribution = [
  { role: 'Members', count: 2400, color: 'bg-gym-primary' },
  { role: 'Trainers', count: 15, color: 'bg-gym-secondary' },
  { role: 'Admins', count: 2, color: 'bg-gym-accent' },
]

export default function AdminOverviewPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="heading-2 text-gym-text">Admin Overview</h1>
          <p className="text-gym-text-muted mt-1">System-wide metrics and quick actions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" asChild>
            <Link href="/admin/users">View All Users</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/users/new">Add New User</Link>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="p-6 rounded-2xl bg-gym-surface border border-gym-border"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br {stat.color} text-white">
                <stat.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="flex items-center space-x-1 text-sm text-gym-primary">
                <stat.trendIcon className="h-4 w-4" />
                <span>{stat.trend}</span>
              </div>
            </div>
            <p className="text-sm text-gym-text-muted">{stat.label}</p>
            <p className="font-heading text-3xl font-bold text-gym-text mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="heading-3 text-gym-text flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-gym-primary" />
              <span>Recent Registrations</span>
            </h2>
            <Link href="/admin/users" className="text-sm text-gym-primary hover:text-gym-primary-dim flex items-center space-x-1">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <Card className="bg-gym-surface border-gym-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gym-border bg-gym-bg/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Member</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Member ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gym-text-muted uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gym-border/50">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gym-bg/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gym-text">{user.name}</p>
                          <p className="text-sm text-gym-text-muted">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          user.role === 'ADMIN' && 'bg-gym-accent/10 text-gym-accent',
                          user.role === 'TRAINER' && 'bg-gym-secondary/10 text-gym-secondary',
                          user.role === 'MEMBER' && 'bg-gym-primary/10 text-gym-primary'
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-gym-text-muted">{user.memberId}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          user.status === 'active' && 'bg-green-500/10 text-green-500',
                          user.status === 'pending' && 'bg-yellow-500/10 text-yellow-500',
                          user.status === 'inactive' && 'bg-gray-500/10 text-gray-500'
                        )}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gym-text-muted">{user.joined}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="heading-3 text-gym-text flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-gym-primary" />
            <span>Role Distribution</span>
          </h2>
          <Card className="bg-gym-surface border-gym-border">
            <CardContent className="p-6 space-y-4">
              {roleDistribution.map((item) => (
                <div key={item.role} className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-lg {item.color} flex items-center justify-center">
                    <span className="text-white font-medium text-sm">{item.role.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gym-text">{item.role}</span>
                      <span className="text-gym-text-muted">{item.count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gym-border rounded-full overflow-hidden mt-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.role === 'Members' ? 99 : item.role === 'Trainers' ? 0.6 : 0.1}%` }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-gym-primary to-gym-secondary rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.section>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="heading-3 text-gym-text">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            icon={UserPlus}
            title="Add New Member"
            description="Create a new member account with credentials"
            href="/admin/users/new"
            color="from-gym-primary to-green-600"
          />
          <QuickActionCard
            icon={UserCheck}
            title="Verify Pending Users"
            description="Review and activate pending registrations"
            href="/admin/users?status=unverified"
            color="from-yellow-500 to-orange-500"
          />
          <QuickActionCard
            icon={Tag}
            title="Membership Plans"
            description="Update prices and plan details site-wide"
            href="/admin/pricing"
            color="from-gym-primary to-gym-secondary"
          />
          <QuickActionCard
            icon={DollarSign}
            title="Revenue Report"
            description="View detailed revenue analytics"
            href="/admin/analytics"
            color="from-purple-500 to-gym-secondary"
          />
          <QuickActionCard
            icon={BarChart3}
            title="System Analytics"
            description="Check-in trends, retention, and more"
            href="/admin/analytics"
            color="from-gym-secondary to-blue-600"
          />
        </div>
      </motion.section>
    </div>
  )
}

function QuickActionCard({ icon: Icon, title, description, href, color }: { 
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
  color: string
}) {
  return (
    <Link
      href={href}
      className="group p-6 rounded-2xl bg-gym-surface border border-gym-border hover:border-gym-primary/50 hover:shadow-neon-primary/20 transition-all duration-300"
    >
      <div className="p-3 rounded-xl bg-gradient-to-br {color} mb-4">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="font-semibold text-gym-text mb-1">{title}</h3>
      <p className="text-sm text-gym-text-muted">{description}</p>
      <span className="inline-flex items-center mt-4 text-sm text-gym-primary font-medium group-hover:gap-1 transition-all">
        View â†’
      </span>
    </Link>
  )
}

import { ChevronRight } from 'lucide-react'
