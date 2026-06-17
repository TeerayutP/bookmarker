import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardBody, Input, Textarea, Button, Chip, Progress } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchAuthors, updateAuthor, deleteAuthor } from './authorsSlice'
import { fetchBooks } from '../books/booksSlice'
import { resolveImg } from '../../lib/imageUrl'
import type { BookStatus } from '../books/booksSlice'

const STATUS_COLOR: Record<BookStatus, 'primary' | 'success' | 'warning' | 'danger'> = {
  reading: 'primary', completed: 'success', on_hold: 'warning', dropped: 'danger',
}

const STATUS_LABEL: Record<BookStatus, string> = {
  reading: 'Reading', completed: 'Completed', on_hold: 'On Hold', dropped: 'Dropped',
}

const AVATAR_COLORS = [
  'from-violet-400 to-purple-600',
  'from-blue-400 to-cyan-600',
  'from-rose-400 to-pink-600',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-600',
]

export default function AuthorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const author = useAppSelector(s => s.authors.items.find(a => a.id === Number(id)))
  const books = useAppSelector(s =>
    s.books.items.filter(b => b.author.toLowerCase() === (author?.name ?? '').toLowerCase())
  )

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!author) dispatch(fetchAuthors())
    dispatch(fetchBooks())
  }, [author, dispatch])

  useEffect(() => {
    if (author) { setName(author.name); setBio(author.bio ?? '') }
  }, [author])

  if (!author) return <p className="text-center py-20 text-default-400">Loading…</p>

  const avatarColor = AVATAR_COLORS[author.name.charCodeAt(0) % AVATAR_COLORS.length]

  const handleSave = async () => {
    setSaving(true)
    try {
      await dispatch(updateAuthor({ id: author.id, data: { name, bio: bio || null } })).unwrap()
      setEditing(false)
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await dispatch(deleteAuthor(author.id)).unwrap(); navigate('/authors') } finally { setDeleting(false) }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Button variant="light" size="sm" className="text-default-500" onPress={() => navigate('/authors')}>
        ← Back to authors
      </Button>

      <Card isBlurred className="border border-white/40 shadow-lg">
        <CardBody className="p-6">
          {editing ? (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-default-800">Edit Author</h2>
              <Input label="Name" value={name} onValueChange={setName} isRequired variant="bordered" />
              <Textarea label="Bio" value={bio} onValueChange={setBio} placeholder="optional" variant="bordered" minRows={4} />
              <div className="flex gap-2 justify-end pt-2 border-t border-default-100">
                <Button variant="flat" onPress={() => setEditing(false)}>Cancel</Button>
                <Button color="secondary" isLoading={saving} onPress={handleSave}>Save Changes</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center shadow-md shrink-0`}>
                  <span className="text-white text-2xl font-bold select-none">{author.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-default-900">{author.name}</h1>
                  {author.bio && <p className="text-default-500 text-sm mt-1 leading-relaxed">{author.bio}</p>}
                  {!author.bio && <p className="text-default-300 text-sm mt-1 italic">No bio added.</p>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Button color="danger" variant="light" size="sm" isLoading={deleting} onPress={handleDelete}>Delete</Button>
                <Button color="secondary" size="sm" onPress={() => setEditing(true)}>Edit Author</Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <div className="space-y-3">
        <h2 className="text-base font-semibold text-default-700 px-1">
          Books by {author.name}
          <span className="ml-2 text-sm font-normal text-default-400">({books.length})</span>
        </h2>

        {books.length === 0 ? (
          <div className="text-center py-10 text-default-300 text-sm">No books linked to this author yet.</div>
        ) : (
          <div className="space-y-2">
            {books.map(book => {
              const progress = book.total_chapters ? (book.current_chapter / book.total_chapters) * 100 : null
              return (
                <Link key={book.id} to={`/books/${book.id}`}>
                  <Card isBlurred className="border border-white/40 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardBody className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0 shadow-sm">
                          {resolveImg(book.cover_url) ? (
                            <img src={resolveImg(book.cover_url)!} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${avatarColor} flex items-center justify-center`}>
                              <span className="text-white text-xs font-bold">{book.title.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-default-900 line-clamp-1">{book.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Chip size="sm" color={STATUS_COLOR[book.status]} variant="flat" className="text-[10px]">
                              {STATUS_LABEL[book.status]}
                            </Chip>
                            <span className="text-xs text-default-400">
                              Ch. {book.current_chapter}{book.total_chapters ? ` / ${book.total_chapters}` : ''}
                            </span>
                          </div>
                          {progress !== null && (
                            <Progress size="sm" value={progress} color={STATUS_COLOR[book.status]} className="mt-1.5" aria-label="progress" />
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
