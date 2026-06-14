import { useEffect } from 'react'
import { Card, CardBody, Spinner } from '@heroui/react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchStats } from './statsSlice'

const STATUS_COLORS: Record<string, string> = {
  reading: '#7c3aed',
  completed: '#16a34a',
  on_hold: '#d97706',
  dropped: '#dc2626',
}

const STATUS_LABELS: Record<string, string> = {
  reading: 'Reading',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped',
}

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { data, loading, error } = useAppSelector((s) => s.stats)

  useEffect(() => {
    dispatch(fetchStats())
  }, [dispatch])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Spinner size="lg" color="secondary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-24">
        <p className="text-danger text-sm">{error}</p>
      </div>
    )
  }

  if (!data) return null

  const donutData = Object.entries(data.by_status).map(([key, value]) => ({
    name: STATUS_LABELS[key] ?? key,
    value,
    key,
  }))

  const barData = data.books_per_month.slice(-6)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-violet-700">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card shadow="sm">
          <CardBody className="p-4">
            <p className="text-xs text-default-500 font-medium uppercase tracking-wide">Total Books</p>
            <p className="text-3xl font-bold text-violet-700 mt-1">{data.total}</p>
          </CardBody>
        </Card>
        <Card shadow="sm">
          <CardBody className="p-4">
            <p className="text-xs text-default-500 font-medium uppercase tracking-wide">Reading</p>
            <p className="text-3xl font-bold text-violet-700 mt-1">{data.by_status.reading}</p>
          </CardBody>
        </Card>
        <Card shadow="sm">
          <CardBody className="p-4">
            <p className="text-xs text-default-500 font-medium uppercase tracking-wide">Completed This Year</p>
            <p className="text-3xl font-bold text-violet-700 mt-1">{data.completed_this_year}</p>
          </CardBody>
        </Card>
        <Card shadow="sm">
          <CardBody className="p-4">
            <p className="text-xs text-default-500 font-medium uppercase tracking-wide">Avg Chapters</p>
            <p className="text-3xl font-bold text-violet-700 mt-1">
              {data.avg_chapters != null ? Math.round(data.avg_chapters) : '—'}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Donut chart — books by status */}
        <Card shadow="sm">
          <CardBody className="p-4">
            <p className="text-sm font-semibold text-default-700 mb-3">Books by Status</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.key} fill={STATUS_COLORS[entry.key] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              {donutData.map((entry) => (
                <span key={entry.key} className="flex items-center gap-1 text-xs text-default-600">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[entry.key] ?? '#94a3b8' }}
                  />
                  {entry.name} ({entry.value})
                </span>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Bar chart — books added per month */}
        <Card shadow="sm">
          <CardBody className="p-4">
            <p className="text-sm font-semibold text-default-700 mb-3">Books Added per Month</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Top categories */}
      {data.top_categories.length > 0 && (
        <Card shadow="sm">
          <CardBody className="p-4">
            <p className="text-sm font-semibold text-default-700 mb-3">Top Categories</p>
            <ol className="space-y-2">
              {data.top_categories.slice(0, 5).map((cat, idx) => (
                <li key={cat.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-default-700">
                    <span className="text-xs text-default-400 w-4">{idx + 1}.</span>
                    {cat.name}
                  </span>
                  <span className="text-xs font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                    {cat.count}
                  </span>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
