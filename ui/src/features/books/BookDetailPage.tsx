import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Input, Select, SelectItem, Textarea, Button, Card, CardBody, Progress, Chip, Divider, Autocomplete, AutocompleteItem } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchBooks, updateBook, patchChapter, deleteBook, BookStatus } from './booksSlice'
import { resolveImg } from '../../lib/imageUrl'
import { useCoverUpload } from '../../lib/useCoverUpload'
import { fetchCategories } from '../categories/categoriesSlice'
import { fetchAuthors } from '../authors/authorsSlice'

const STATUS_OPTIONS: { key: BookStatus; label: string }[] = [
  { key: 'reading', label: 'Reading' },
  { key: 'on_hold', label: 'On Hold' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'completed', label: 'Completed' },
]

const STATUS_COLOR: Record<BookStatus, 'primary' | 'success' | 'warning' | 'danger'> = {
  reading: 'primary', completed: 'success', on_hold: 'warning', dropped: 'danger',
}

const STATUS_LABEL: Record<BookStatus, string> = {
  reading: 'Reading', completed: 'Completed', on_hold: 'On Hold', dropped: 'Dropped',
}

function CoverPlaceholder({ title }: { title: string }) {
  const colors = [
    'from-violet-400 to-purple-600',
    'from-blue-400 to-cyan-600',
    'from-rose-400 to-pink-600',
    'from-amber-400 to-orange-600',
    'from-emerald-400 to-teal-600',
  ]
  const color = colors[title.charCodeAt(0) % colors.length]
  return (
    <div className={`w-full h-full bg-gradient-to-br ${color} flex items-center justify-center rounded-xl`}>
      <span className="text-white text-6xl font-bold opacity-80 select-none">
        {title.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const book = useAppSelector(s => s.books.items.find(b => b.id === Number(id)))
  const categories = useAppSelector(s => s.categories.items)
  const authorRecord = useAppSelector(s =>
    s.authors.items.find(a => a.name.toLowerCase() === (book?.author ?? '').toLowerCase())
  )

  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [totalChapters, setTotalChapters] = useState('')
  const [status, setStatus] = useState<BookStatus>('reading')
  const [coverUrl, setCoverUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [categoryInput, setCategoryInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { open: openFilePicker, uploading, Input: FileInput } = useCoverUpload(setCoverUrl)

  useEffect(() => {
    if (!book) dispatch(fetchBooks())
    dispatch(fetchCategories())
    dispatch(fetchAuthors())
  }, [book, dispatch])

  useEffect(() => {
    if (book) {
      setTitle(book.title)
      setAuthor(book.author)
      setTotalChapters(book.total_chapters?.toString() ?? '')
      setStatus(book.status)
      setCoverUrl(book.cover_url ?? '')
      setNotes(book.notes ?? '')
      const cat = categories.find(c => c.id === book.category_id)
      setCategoryInput(cat?.name ?? '')
    }
  }, [book, categories])

  if (!book) return <p className="text-center py-20 text-default-400">Loading…</p>

  const handleSave = async () => {
    setSaving(true)
    try {
      await dispatch(updateBook({
        id: book.id,
        data: { title, author, total_chapters: totalChapters ? Number(totalChapters) : null, status, cover_url: coverUrl || null, notes: notes || null, category_name: categoryInput || null },
      })).unwrap()
      setEditing(false)
    } finally { setSaving(false) }
  }

  const handleChapterChange = (delta: number) =>
    dispatch(patchChapter({ id: book.id, chapter: Math.max(0, book.current_chapter + delta) }))

  const handleDelete = async () => {
    setDeleting(true)
    try { await dispatch(deleteBook(book.id)).unwrap(); navigate('/') } finally { setDeleting(false) }
  }

  const progress = book.total_chapters ? (book.current_chapter / book.total_chapters) * 100 : null

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="light" size="sm" className="mb-4 text-default-500" onPress={() => navigate('/')}>
        ← Back to library
      </Button>

      <Card isBlurred className="border border-white/40 shadow-lg overflow-visible">
        <CardBody className="p-0">
          {editing ? (
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-default-800">Edit Book</h2>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Title" value={title} onValueChange={setTitle} isRequired variant="bordered" className="col-span-2" />
                <Input label="Author" value={author} onValueChange={setAuthor} isRequired variant="bordered" className="col-span-2" />
                <Input label="Total Chapters" type="number" min={1} value={totalChapters} onValueChange={setTotalChapters} placeholder="optional" variant="bordered" />
                <Select label="Status" selectedKeys={[status]} onSelectionChange={k => setStatus([...k][0] as BookStatus)} variant="bordered">
                  {STATUS_OPTIONS.map(o => <SelectItem key={o.key}>{o.label}</SelectItem>)}
                </Select>
              </div>
              <Autocomplete
                label="Category"
                inputValue={categoryInput}
                onInputChange={setCategoryInput}
                allowsCustomValue
                variant="bordered"
                placeholder="optional"
                description={categoryInput && !categories.find(c => c.name.toLowerCase() === categoryInput.toLowerCase()) ? 'New category — will be created automatically' : undefined}
              >
                {categories.map(c => (
                  <AutocompleteItem key={c.name}>{c.name}</AutocompleteItem>
                ))}
              </Autocomplete>
              <div className="space-y-1.5">
                <Input label="Cover URL" value={coverUrl} onValueChange={setCoverUrl} placeholder="optional" variant="bordered" />
                <FileInput />
                <Button size="sm" variant="flat" color="secondary" onPress={openFilePicker} isLoading={uploading} fullWidth>
                  {uploading ? 'Uploading…' : '📁 Upload image file'}
                </Button>
              </div>
              {resolveImg(coverUrl) && (
                <div className="aspect-[3/4] w-24 rounded-lg overflow-hidden border border-default-200">
                  <img src={resolveImg(coverUrl)!} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
              <Textarea label="Notes" value={notes} onValueChange={setNotes} variant="bordered" minRows={3} />
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="flat" onPress={() => setEditing(false)}>Cancel</Button>
                <Button color="secondary" isLoading={saving} onPress={handleSave}>Save Changes</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-0">
              <div className="sm:w-36 shrink-0 p-4 flex sm:block justify-center">
                <div className="aspect-[3/4] w-28 sm:w-full rounded-xl overflow-hidden shadow-md">
                  {resolveImg(book.cover_url) ? (
                    <img src={resolveImg(book.cover_url)!} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <CoverPlaceholder title={book.title} />
                  )}
                </div>
              </div>

              <div className="flex-1 px-5 pb-5 sm:py-5 space-y-4 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h1 className="text-xl font-bold text-default-900 leading-tight">{book.title}</h1>
                    {authorRecord ? (
                      <Link to={`/authors/${authorRecord.id}`} className="text-default-500 text-sm mt-0.5 hover:text-violet-600 hover:underline transition-colors">
                        {book.author}
                      </Link>
                    ) : (
                      <p className="text-default-500 text-sm mt-0.5">{book.author}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 items-end shrink-0">
                    <Chip size="sm" color={STATUS_COLOR[book.status]} variant="flat">
                      {STATUS_LABEL[book.status]}
                    </Chip>
                    {book.category_id && categories.find(c => c.id === book.category_id) && (
                      <Chip size="sm" variant="flat" color="default" className="text-default-500">
                        {categories.find(c => c.id === book.category_id)!.name}
                      </Chip>
                    )}
                  </div>
                </div>

                <Divider />

                <div className="space-y-3">
                  <p className="text-xs font-medium text-default-400 uppercase tracking-wide">Chapter Progress</p>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="bordered"
                      isIconOnly
                      onPress={() => handleChapterChange(-1)}
                      isDisabled={book.current_chapter === 0}
                      className="rounded-full w-8 h-8 min-w-0"
                    >
                      −
                    </Button>
                    <div className="text-center">
                      <span className="text-3xl font-bold text-default-900">{book.current_chapter}</span>
                      {book.total_chapters && (
                        <span className="text-default-400 text-sm ml-1">/ {book.total_chapters}</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="bordered"
                      isIconOnly
                      onPress={() => handleChapterChange(1)}
                      isDisabled={book.total_chapters ? book.current_chapter >= book.total_chapters : false}
                      className="rounded-full w-8 h-8 min-w-0"
                    >
                      +
                    </Button>
                  </div>
                  {progress !== null && (
                    <div className="space-y-1">
                      <Progress value={progress} color={STATUS_COLOR[book.status]} aria-label="Reading progress" showValueLabel size="sm" />
                    </div>
                  )}
                </div>

                {book.notes && (
                  <>
                    <Divider />
                    <div>
                      <p className="text-xs font-medium text-default-400 uppercase tracking-wide mb-1">Notes</p>
                      <p className="text-sm text-default-700 whitespace-pre-wrap leading-relaxed">{book.notes}</p>
                    </div>
                  </>
                )}

                <Divider />

                <div className="flex items-center justify-between pt-1">
                  <Button color="danger" variant="light" size="sm" isLoading={deleting} onPress={handleDelete}>
                    Delete
                  </Button>
                  <Button color="secondary" size="sm" onPress={() => setEditing(true)}>
                    Edit Book
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
