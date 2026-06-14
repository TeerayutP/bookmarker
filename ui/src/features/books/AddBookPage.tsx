import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Select, SelectItem, Textarea, Button, Card, CardBody } from '@heroui/react'
import { useAppDispatch } from '../../store/hooks'
import { createBook, BookStatus } from './booksSlice'

const STATUS_OPTIONS: { key: BookStatus; label: string }[] = [
  { key: 'reading', label: 'Reading' },
  { key: 'on_hold', label: 'On Hold' },
  { key: 'dropped', label: 'Dropped' },
  { key: 'completed', label: 'Completed' },
]

export default function AddBookPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [totalChapters, setTotalChapters] = useState('')
  const [currentChapter, setCurrentChapter] = useState('0')
  const [status, setStatus] = useState<BookStatus>('reading')
  const [coverUrl, setCoverUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

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
        notes: notes || null,
      })).unwrap()
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-default-900">Add a Book</h1>
        <p className="text-default-500 text-sm mt-1">Track a new book in your library.</p>
      </div>

      <Card isBlurred className="border border-white/40 shadow-lg">
        <CardBody className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-6">
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-28 aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-default-200 bg-default-50 flex items-center justify-center">
                  {coverUrl ? (
                    <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <p className="text-3xl">📖</p>
                      <p className="text-[10px] text-default-300 mt-1">Cover preview</p>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-default-400 text-center w-28">Paste a cover URL below</p>
              </div>

              <div className="flex-1 space-y-4 min-w-0">
                <Input label="Title" value={title} onValueChange={setTitle} isRequired variant="bordered" placeholder="Book title" />
                <Input label="Author" value={author} onValueChange={setAuthor} isRequired variant="bordered" placeholder="Author name" />

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Current Chapter"
                    type="number"
                    min={0}
                    value={currentChapter}
                    onValueChange={setCurrentChapter}
                    variant="bordered"
                  />
                  <Input
                    label="Total Chapters"
                    type="number"
                    min={1}
                    value={totalChapters}
                    onValueChange={setTotalChapters}
                    placeholder="optional"
                    variant="bordered"
                  />
                </div>

                <Select
                  label="Status"
                  selectedKeys={[status]}
                  onSelectionChange={keys => setStatus([...keys][0] as BookStatus)}
                  variant="bordered"
                >
                  {STATUS_OPTIONS.map(o => <SelectItem key={o.key}>{o.label}</SelectItem>)}
                </Select>

                <Input
                  label="Cover URL"
                  value={coverUrl}
                  onValueChange={setCoverUrl}
                  placeholder="https://… (optional)"
                  variant="bordered"
                />

                <Textarea
                  label="Notes"
                  value={notes}
                  onValueChange={setNotes}
                  placeholder="Any thoughts, bookmarks, spoilers… (optional)"
                  variant="bordered"
                  minRows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-default-100">
              <Button variant="flat" onPress={() => navigate('/')}>Cancel</Button>
              <Button type="submit" color="secondary" isLoading={loading}>Add to Library</Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
