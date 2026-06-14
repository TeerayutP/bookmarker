import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Spinner } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCategories, deleteCategory } from './categoriesSlice'

const TAG_COLORS = [
  { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-400' },
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' },
  { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-400' },
  { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-400' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-200', dot: 'bg-fuchsia-400' },
]

export default function CategoryListPage() {
  const dispatch = useAppDispatch()
  const { items, loading, error } = useAppSelector(s => s.categories)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => { dispatch(fetchCategories()) }, [dispatch])

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try { await dispatch(deleteCategory(id)) } finally { setDeletingId(null) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" color="secondary" /></div>
  if (error) return <p className="text-danger text-center py-10">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-default-900">Categories</h1>
          {items.length > 0 && (
            <p className="text-sm text-default-400 mt-0.5">
              {items.length} categor{items.length !== 1 ? 'ies' : 'y'}
            </p>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 space-y-2">
          <p className="text-5xl">🏷️</p>
          <p className="text-default-400 font-medium">No categories yet.</p>
          <p className="text-default-300 text-sm">Create a category to organise your books.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((cat, i) => {
            const color = TAG_COLORS[i % TAG_COLORS.length]
            return (
              <div
                key={cat.id}
                className={`group flex items-center justify-between gap-3 rounded-2xl border ${color.border} ${color.bg} px-4 py-3 transition-shadow hover:shadow-sm`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color.dot}`} />
                  <div className="min-w-0">
                    <p className={`font-semibold text-sm ${color.text} leading-tight`}>{cat.name}</p>
                    <p className="text-xs text-default-400 mt-0.5 font-mono">/{cat.slug}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button
                    as={Link}
                    to={`/categories/${cat.id}`}
                    size="sm"
                    variant="flat"
                    color="secondary"
                    className="min-w-0 px-3"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    className="min-w-0 px-3"
                    isLoading={deletingId === cat.id}
                    onPress={() => handleDelete(cat.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
