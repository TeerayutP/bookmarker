import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Select, SelectItem, Textarea, Button, Card, CardBody, CardHeader } from '@heroui/react'
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
      await dispatch(createBook({ title, author, total_chapters: totalChapters ? Number(totalChapters) : null, current_chapter: Number(currentChapter), status, cover_url: coverUrl || null, notes: notes || null })).unwrap()
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card isBlurred className="max-w-lg mx-auto">
      <CardHeader><h1 className="text-xl font-bold">Add Book</h1></CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={title} onValueChange={setTitle} isRequired variant="bordered" />
          <Input label="Author" value={author} onValueChange={setAuthor} isRequired variant="bordered" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Current Chapter" type="number" min={0} value={currentChapter} onValueChange={setCurrentChapter} variant="bordered" />
            <Input label="Total Chapters" type="number" min={1} value={totalChapters} onValueChange={setTotalChapters} placeholder="optional" variant="bordered" />
          </div>
          <Select label="Status" selectedKeys={[status]} onSelectionChange={keys => setStatus([...keys][0] as BookStatus)} variant="bordered">
            {STATUS_OPTIONS.map(o => <SelectItem key={o.key}>{o.label}</SelectItem>)}
          </Select>
          <Input label="Cover URL" value={coverUrl} onValueChange={setCoverUrl} placeholder="optional" variant="bordered" />
          <Textarea label="Notes" value={notes} onValueChange={setNotes} placeholder="optional" variant="bordered" />
          <div className="flex gap-3 justify-end">
            <Button variant="flat" onPress={() => navigate('/')}>Cancel</Button>
            <Button type="submit" color="secondary" isLoading={loading}>Add Book</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
