import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Input, Textarea, Button, Card, CardBody, Chip, Divider, Spinner, Autocomplete, AutocompleteItem } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchLibraryBook, updateLibraryBook } from './librarySlice'
import { addToReadingList } from '../books/booksSlice'
import { fetchCategories } from '../categories/categoriesSlice'
import { resolveImg } from '../../lib/imageUrl'
import { useCoverUpload } from '../../lib/useCoverUpload'

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

export default function LibraryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const book = useAppSelector(s => s.library.items.find(b => b.id === Number(id)))
  const myBookIds = useAppSelector(s => new Set(s.books.items.map(b => b.book_id)))
  const categories = useAppSelector(s => s.categories.items)

  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [totalChapters, setTotalChapters] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [categoryInput, setCategoryInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [adding, setAdding] = useState(false)

  const { open: openFilePicker, uploading, fetching, fetchFromUrl, Input: FileInput } = useCoverUpload(setCoverUrl)

  useEffect(() => {
    if (!book) dispatch(fetchLibraryBook(Number(id)))
    dispatch(fetchCategories())
  }, [])

  useEffect(() => {
    if (book) {
      setTitle(book.title)
      setAuthor(book.author)
      setTotalChapters(book.total_chapters?.toString() ?? '')
      setCoverUrl(book.cover_url ?? '')
      setSynopsis(book.synopsis ?? '')
      const cat = categories.find(c => c.id === book.category_id)
      setCategoryInput(cat?.name ?? '')
    }
  }, [book, categories])

  if (!book) return <div className="flex justify-center py-20"><Spinner size="lg" color="secondary" /></div>

  const inList = myBookIds.has(book.id)
  const category = categories.find(c => c.id === book.category_id)

  const handleSave = async () => {
    setSaving(true)
    try {
      await dispatch(updateLibraryBook({
        id: book.id,
        data: {
          title,
          author,
          total_chapters: totalChapters ? Number(totalChapters) : null,
          cover_url: coverUrl || null,
          synopsis: synopsis || null,
          category_name: categoryInput || null,
        },
      })).unwrap()
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleAddToList = async () => {
    setAdding(true)
    try {
      await dispatch(addToReadingList(book.id)).unwrap()
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="light" size="sm" className="mb-4 text-default-500" onPress={() => navigate('/library')}>
        ← Library
      </Button>

      <Card isBlurred className="border border-white/40 shadow-lg overflow-visible">
        <CardBody className="p-0">
          {editing ? (
            <div className="p-6 space-y-4">
              <h2 className="text-lg font-bold text-default-800">Edit Library Entry</h2>

              <Input label="Title" value={title} onValueChange={setTitle} isRequired variant="bordered" />
              <Input label="Author" value={author} onValueChange={setAuthor} isRequired variant="bordered" />
              <Input
                label="Total Chapters"
                type="number"
                min={1}
                value={totalChapters}
                onValueChange={setTotalChapters}
                placeholder="optional"
                variant="bordered"
              />

              <Autocomplete
                label="Category"
                inputValue={categoryInput}
                onInputChange={setCategoryInput}
                allowsCustomValue
                variant="bordered"
                placeholder="optional"
                description={
                  categoryInput && !categories.find(c => c.name.toLowerCase() === categoryInput.toLowerCase())
                    ? 'New category — will be created automatically'
                    : undefined
                }
              >
                {categories.map(c => <AutocompleteItem key={c.name}>{c.name}</AutocompleteItem>)}
              </Autocomplete>

              <div className="space-y-1.5">
                <Input label="Cover URL" value={coverUrl} onValueChange={setCoverUrl} placeholder="optional" variant="bordered" />
                <FileInput />
                <Button size="sm" variant="flat" color="secondary" onPress={openFilePicker} isLoading={uploading} fullWidth>
                  {uploading ? 'Uploading…' : '📁 Upload image file'}
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  color="secondary"
                  onPress={() => fetchFromUrl(coverUrl)}
                  isLoading={fetching}
                  isDisabled={!coverUrl.startsWith('http')}
                  fullWidth
                >
                  {fetching ? 'Fetching…' : '🌐 Fetch from URL'}
                </Button>
              </div>

              {resolveImg(coverUrl) && (
                <div className="aspect-[3/4] w-24 rounded-lg overflow-hidden border border-default-200">
                  <img src={resolveImg(coverUrl)!} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}

              <Textarea
                label="Synopsis"
                value={synopsis}
                onValueChange={setSynopsis}
                placeholder="Brief description… (optional)"
                variant="bordered"
                minRows={3}
              />

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
                    <p className="text-default-500 text-sm mt-0.5">{book.author}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end shrink-0">
                    {category && (
                      <Chip size="sm" variant="flat" color="default" className="text-default-500">
                        {category.name}
                      </Chip>
                    )}
                    {book.total_chapters && (
                      <Chip size="sm" variant="flat" color="default" className="text-default-400">
                        {book.total_chapters} ch.
                      </Chip>
                    )}
                  </div>
                </div>

                {book.synopsis && (
                  <>
                    <Divider />
                    <div>
                      <p className="text-xs font-semibold text-default-500 uppercase tracking-wide mb-1">Synopsis</p>
                      <p className="text-sm text-default-700 leading-relaxed whitespace-pre-wrap">{book.synopsis}</p>
                    </div>
                  </>
                )}

                <Divider />

                <div className="flex items-center justify-between gap-2 pt-1">
                  <Button color="secondary" variant="light" size="sm" onPress={() => setEditing(true)}>
                    Edit
                  </Button>
                  {inList ? (
                    <Button as={Link} to="/" color="success" variant="flat" size="sm">
                      In My List → View
                    </Button>
                  ) : (
                    <Button color="secondary" variant="flat" size="sm" isLoading={adding} onPress={handleAddToList}>
                      + Add to My List
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
