import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardBody, Button, Spinner } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchAuthors, deleteAuthor } from './authorsSlice'

const AVATAR_COLORS = [
  'from-violet-400 to-purple-600',
  'from-blue-400 to-cyan-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-600',
]

function AuthorAvatar({ name }: { name: string }) {
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
  return (
    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-sm`}>
      <span className="text-white text-lg font-bold select-none">{name.charAt(0).toUpperCase()}</span>
    </div>
  )
}

export default function AuthorListPage() {
  const dispatch = useAppDispatch()
  const { items, loading, error } = useAppSelector(s => s.authors)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => { dispatch(fetchAuthors()) }, [dispatch])

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try { await dispatch(deleteAuthor(id)) } finally { setDeletingId(null) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" color="secondary" /></div>
  if (error) return <p className="text-danger text-center py-10">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-default-900">Authors</h1>
          {items.length > 0 && <p className="text-sm text-default-400 mt-0.5">{items.length} author{items.length !== 1 ? 's' : ''}</p>}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 space-y-2">
          <p className="text-5xl">✍️</p>
          <p className="text-default-400 font-medium">No authors yet.</p>
          <p className="text-default-300 text-sm">Add an author to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(author => (
            <Link key={author.id} to={`/authors/${author.id}`} className="block group">
              <Card isBlurred className="border border-white/40 shadow-sm group-hover:shadow-md transition-shadow h-full">
                <CardBody className="p-4">
                  <div className="flex items-start gap-3">
                    <AuthorAvatar name={author.name} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-default-900 leading-tight group-hover:text-violet-700 transition-colors">{author.name}</p>
                      {author.bio ? (
                        <p className="text-xs text-default-400 mt-1 line-clamp-2 leading-relaxed">{author.bio}</p>
                      ) : (
                        <p className="text-xs text-default-300 mt-1 italic">No bio</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-default-100" onClick={e => e.preventDefault()}>
                    <Button
                      as={Link}
                      to={`/authors/${author.id}`}
                      size="sm"
                      variant="flat"
                      color="secondary"
                      className="flex-1"
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      className="flex-1"
                      isLoading={deletingId === author.id}
                      onPress={() => handleDelete(author.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
