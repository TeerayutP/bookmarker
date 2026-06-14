import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Input, Select, SelectItem, Textarea, Button, Card, CardBody, CardHeader, Progress, Chip, Divider } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchBooks, updateBook, patchChapter, deleteBook, BookStatus } from './booksSlice'

const STATUS_OPTIONS: { key: BookStatus; label: string }[] = [
  { key: 'reading', label: 'Reading' },
  { key: 'on_hold', label: 'On Hold' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'completed', label: 'Completed' },
]

const STATUS_COLOR: Record<BookStatus, 'primary' | 'success' | 'warning' | 'danger'> = {
  reading: 'primary', completed: 'success', on_hold: 'warning', dropped: 'danger',
}

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const book = useAppSelector(s => s.books.items.find(b => b.id === Number(id)))

  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [totalChapters, setTotalChapters] = useState('')
  const [status, setStatus] = useState<BookStatus>('reading')
  const [coverUrl, setCoverUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { if (!book) dispatch(fetchBooks()) }, [book, dispatch])
  useEffect(() => {
    if (book) { setTitle(book.title); setAuthor(book.author); setTotalChapters(book.total_chapters?.toString() ?? ''); setStatus(book.status); setCoverUrl(book.cover_url ?? ''); setNotes(book.notes ?? '') }
  }, [book])

  if (!book) return <p className="text-center py-20 text-default-400">Loading…</p>

  const handleSave = async () => {
    setSaving(true)
    try {
      await dispatch(updateBook({ id: book.id, data: { title, author, total_chapters: totalChapters ? Number(totalChapters) : null, status, cover_url: coverUrl || null, notes: notes || null } })).unwrap()
      setEditing(false)
    } finally { setSaving(false) }
  }

  const handleChapterChange = (delta: number) => dispatch(patchChapter({ id: book.id, chapter: Math.max(0, book.current_chapter + delta) }))

  const handleDelete = async () => {
    setDeleting(true)
    try { await dispatch(deleteBook(book.id)).unwrap(); navigate('/') } finally { setDeleting(false) }
  }

  const progress = book.total_chapters ? (book.current_chapter / book.total_chapters) * 100 : null

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Card isBlurred>
        <CardHeader className="flex justify-between items-start">
          {editing ? <h1 className="text-xl font-bold">Edit Book</h1> : <div><h1 className="text-xl font-bold">{book.title}</h1><p className="text-default-500">{book.author}</p></div>}
          <Chip size="sm" color={STATUS_COLOR[book.status]} variant="flat">{book.status.replace('_', ' ')}</Chip>
        </CardHeader>
        <CardBody className="space-y-4">
          {editing ? (
            <>
              <Input label="Title" value={title} onValueChange={setTitle} isRequired variant="bordered" />
              <Input label="Author" value={author} onValueChange={setAuthor} isRequired variant="bordered" />
              <Input label="Total Chapters" type="number" min={1} value={totalChapters} onValueChange={setTotalChapters} placeholder="optional" variant="bordered" />
              <Select label="Status" selectedKeys={[status]} onSelectionChange={keys => setStatus([...keys][0] as BookStatus)} variant="bordered">
                {STATUS_OPTIONS.map(o => <SelectItem key={o.key}>{o.label}</SelectItem>)}
              </Select>
              <Input label="Cover URL" value={coverUrl} onValueChange={setCoverUrl} placeholder="optional" variant="bordered" />
              <Textarea label="Notes" value={notes} onValueChange={setNotes} variant="bordered" />
              <div className="flex gap-3 justify-end">
                <Button variant="flat" onPress={() => setEditing(false)}>Cancel</Button>
                <Button color="secondary" isLoading={saving} onPress={handleSave}>Save</Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-small text-default-500">Chapter progress</p>
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="flat" isIconOnly onPress={() => handleChapterChange(-1)}>−</Button>
                  <span className="text-lg font-semibold min-w-[3ch] text-center">{book.current_chapter}</span>
                  <Button size="sm" variant="flat" isIconOnly onPress={() => handleChapterChange(1)}>+</Button>
                  {book.total_chapters && <span className="text-default-400 text-small">/ {book.total_chapters}</span>}
                </div>
                {progress !== null && <Progress value={progress} color={STATUS_COLOR[book.status]} className="mt-2" aria-label="Reading progress" showValueLabel />}
              </div>
              {book.notes && <><Divider /><div><p className="text-small text-default-500 mb-1">Notes</p><p className="whitespace-pre-wrap">{book.notes}</p></div></>}
              <div className="flex gap-3 justify-between pt-2">
                <Button color="danger" variant="flat" isLoading={deleting} onPress={handleDelete}>Delete</Button>
                <div className="flex gap-2">
                  <Button variant="flat" onPress={() => navigate('/')}>Back</Button>
                  <Button color="secondary" onPress={() => setEditing(true)}>Edit</Button>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
