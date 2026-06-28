import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Select, SelectItem, Textarea, Button, Card, CardBody, Autocomplete, AutocompleteItem } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { createBook, BookStatus } from '../books/booksSlice'
import { resolveImg } from '../../lib/imageUrl'
import { useCoverUpload } from '../../lib/useCoverUpload'
import { fetchAuthors } from '../authors/authorsSlice'
import { fetchCategories } from '../categories/categoriesSlice'

const STATUS_OPTIONS: { key: BookStatus; label: string }[] = [
  { key: 'reading', label: 'Reading' },
  { key: 'on_hold', label: 'On Hold' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'completed', label: 'Completed' },
]

export default function LibraryNewPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const authors = useAppSelector(s => s.authors.items)
  const categories = useAppSelector(s => s.categories.items)

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [categoryInput, setCategoryInput] = useState('')
  const [totalChapters, setTotalChapters] = useState('')
  const [currentChapter, setCurrentChapter] = useState('0')
  const [status, setStatus] = useState<BookStatus>('reading')
  const [coverUrl, setCoverUrl] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const { open: openFilePicker, uploading, fetching, fetchFromUrl, Input: FileInput } = useCoverUpload(setCoverUrl)

  useEffect(() => {
    dispatch(fetchAuthors())
    dispatch(fetchCategories())
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await dispatch(createBook({
        title,
        author,
        total_chapters: totalChapters ? Number(totalChapters) : null,
        current_chapter: Number(currentChapter),
        status,
        cover_url: coverUrl || null,
        synopsis: synopsis || null,
        notes: notes || null,
        category_name: categoryInput || null,
      })).unwrap()
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-default-900">Add a New Book</h1>
        <p className="text-default-500 text-sm mt-1">Add to the shared library and your reading list.</p>
      </div>

      <Card isBlurred className="border border-white/40 shadow-lg">
        <CardBody className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex sm:flex-col items-center gap-3 sm:shrink-0">
                <div className="w-20 sm:w-28 aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-default-200 bg-default-50 flex items-center justify-center shrink-0">
                  {resolveImg(coverUrl) ? (
                    <img src={resolveImg(coverUrl)!} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <p className="text-3xl">📖</p>
                      <p className="text-[10px] text-default-300 mt-1">Cover preview</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4 min-w-0">
                <Input label="Title" value={title} onValueChange={setTitle} isRequired variant="bordered" placeholder="Book title" />

                <Autocomplete
                  label="Author"
                  inputValue={author}
                  onInputChange={setAuthor}
                  allowsCustomValue
                  variant="bordered"
                  isRequired
                  placeholder="Author name"
                  description={author && !authors.find(a => a.name.toLowerCase() === author.toLowerCase()) ? 'New author — will be created automatically' : undefined}
                >
                  {authors.map(a => <AutocompleteItem key={a.name}>{a.name}</AutocompleteItem>)}
                </Autocomplete>

                <Autocomplete
                  label="Category"
                  inputValue={categoryInput}
                  onInputChange={setCategoryInput}
                  allowsCustomValue
                  variant="bordered"
                  placeholder="e.g. Fantasy (optional)"
                  description={categoryInput && !categories.find(c => c.name.toLowerCase() === categoryInput.toLowerCase()) ? 'New category — will be created automatically' : undefined}
                >
                  {categories.map(c => <AutocompleteItem key={c.name}>{c.name}</AutocompleteItem>)}
                </Autocomplete>

                <div className="grid grid-cols-2 gap-3">
                  <Input label="Current Chapter" type="number" min={0} value={currentChapter} onValueChange={setCurrentChapter} variant="bordered" />
                  <Input label="Total Chapters" type="number" min={1} value={totalChapters} onValueChange={setTotalChapters} placeholder="optional" variant="bordered" />
                </div>

                <Select label="Status" selectedKeys={[status]} onSelectionChange={keys => setStatus([...keys][0] as BookStatus)} variant="bordered">
                  {STATUS_OPTIONS.map(o => <SelectItem key={o.key}>{o.label}</SelectItem>)}
                </Select>

                <div className="space-y-1.5">
                  <Input label="Cover URL" value={coverUrl} onValueChange={setCoverUrl} placeholder="https://… (optional)" variant="bordered" />
                  <FileInput />
                  <Button size="sm" variant="flat" color="secondary" onPress={openFilePicker} isLoading={uploading} className="w-full">
                    {uploading ? 'Uploading…' : '📁 Upload image file'}
                  </Button>
                  <Button size="sm" variant="flat" color="secondary" onPress={() => fetchFromUrl(coverUrl)} isLoading={fetching} isDisabled={!coverUrl.startsWith('http')} className="w-full">
                    {fetching ? 'Fetching…' : '🌐 Fetch from URL'}
                  </Button>
                </div>

                <Textarea label="Synopsis" value={synopsis} onValueChange={setSynopsis} placeholder="Brief description… (optional)" variant="bordered" minRows={3} />
                <Textarea label="Notes" value={notes} onValueChange={setNotes} placeholder="Any thoughts… (optional)" variant="bordered" minRows={3} />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-default-100">
              <Button variant="flat" onPress={() => navigate('/library')}>Cancel</Button>
              <Button type="submit" color="secondary" isLoading={loading}>Add to Library</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
