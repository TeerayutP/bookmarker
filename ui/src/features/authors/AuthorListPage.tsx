import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardBody, Button, Spinner, Chip, Progress } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchAuthors, deleteAuthor } from './authorsSlice'
import { fetchBooks, type BookStatus } from '../books/booksSlice'
import { resolveImg } from '../../lib/imageUrl'

const AVATAR_COLORS = [
  'from-violet-400 to-purple-600',
  'from-blue-400 to-cyan-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-600',
]

const STATUS_COLOR: Record<BookStatus, 'primary' | 'success' | 'warning' | 'danger'> = {
  reading: 'primary', completed: 'success', on_hold: 'warning', dropped: 'danger',
}

const STATUS_LABEL: Record<BookStatus, string> = {
  reading: 'Reading', completed: 'Completed', on_hold: 'On Hold', dropped: 'Dropped',
}

function AuthorAvatar({ name, size = 'md' }: { name: string; size?: 'md' | 'lg' }) {
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
  const sizeClass = size === 'lg' ? 'w-14 h-14 text-2xl' : 'w-10 h-10 text-lg'
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-sm`}>
      <span className="text-white font-bold select-none">{name.charAt(0).toUpperCase()}</span>
    </div>
  )
}

export default function AuthorListPage() {
  const dispatch = useAppDispatch()
  const { items: authors, loading, error } = useAppSelector(s => s.authors)
  const allBooks = useAppSelector(s => s.books.items)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    dispatch(fetchAuthors())
    dispatch(fetchBooks())
  }, [dispatch])

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
          {authors.length > 0 && <p className="text-sm text-default-400 mt-0.5">{authors.length} author{authors.length !== 1 ? 's' : ''}</p>}
        </div>
        <Button as={Link} to="/authors/new" color="secondary" variant="flat" size="sm">
          + Add Author
        </Button>
      </div>

      {authors.length === 0 ? (
        <div className="text-center py-20 space-y-2">
          <p className="text-5xl">✍️</p>
          <p className="text-default-400 font-medium">No authors yet.</p>
          <p className="text-default-300 text-sm">Add an author to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {authors.map(author => {
            const books = allBooks.filter(b => b.author.toLowerCase() === author.name.toLowerCase())
            const avatarColor = AVATAR_COLORS[author.name.charCodeAt(0) % AVATAR_COLORS.length]
            return (
              <Card key={author.id} isBlurred className="border border-white/40 shadow-sm">
                <CardBody className="p-0">
                  <div className="flex flex-col sm:flex-row min-h-0">
                    {/* Author panel */}
                    <div className="sm:w-52 shrink-0 flex flex-col gap-3 p-4 border-b sm:border-b-0 sm:border-r border-default-100">
                      <Link to={`/authors/${author.id}`} className="flex items-center gap-3 group">
                        <AuthorAvatar name={author.name} size="lg" />
                        <div className="min-w-0">
                          <p className="font-semibold text-default-900 leading-tight group-hover:text-violet-700 transition-colors line-clamp-2">
                            {author.name}
                          </p>
                          <p className="text-xs text-default-400 mt-0.5">{books.length} book{books.length !== 1 ? 's' : ''}</p>
                        </div>
                      </Link>

                      {author.bio && (
                        <p className="text-xs text-default-500 leading-relaxed line-clamp-3">{author.bio}</p>
                      )}

                      <div className="flex gap-2 mt-auto pt-1">
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
                    </div>

                    {/* Books panel */}
                    <div className="flex-1 min-w-0 p-4">
                      {books.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-xs text-default-300 italic">No books linked yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2 w-full">
                          {books.map(book => {
                            const progress = book.total_chapters
                              ? (book.current_chapter / book.total_chapters) * 100
                              : null
                            return (
                              <Link key={book.id} to={`/books/${book.id}`} className="flex items-center gap-3 px-2 h-16 w-full rounded-xl hover:bg-default-100/60 transition-colors group/book">
                                <div className="w-9 h-12 rounded-lg overflow-hidden shrink-0 shadow-sm">
                                  {resolveImg(book.cover_url) ? (
                                    <img
                                      src={resolveImg(book.cover_url)!}
                                      alt={book.title}
                                      className="w-full h-full object-cover"
                                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                                    />
                                  ) : (
                                    <div className={`w-full h-full bg-gradient-to-br ${avatarColor} flex items-center justify-center`}>
                                      <span className="text-white text-[10px] font-bold">{book.title.charAt(0)}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                  <p className="text-sm font-medium text-default-900 line-clamp-1 group-hover/book:text-violet-700 transition-colors">
                                    {book.title}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Chip size="sm" color={STATUS_COLOR[book.status]} variant="flat" className="text-[10px]">
                                      {STATUS_LABEL[book.status]}
                                    </Chip>
                                    <span className="text-[11px] text-default-400">
                                      Ch.{book.current_chapter}{book.total_chapters ? `/${book.total_chapters}` : ''}
                                    </span>
                                  </div>
                                  <Progress
                                    size="sm"
                                    value={progress ?? 0}
                                    color={STATUS_COLOR[book.status]}
                                    aria-label="progress"
                                    className={progress === null ? 'opacity-0' : ''}
                                  />
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
