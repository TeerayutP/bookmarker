import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Tabs, Tab, Input, Card, CardBody, CardFooter, Chip, Progress, Spinner } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchBooks, setFilter, BookStatus } from './booksSlice'

const STATUS_TABS: { key: BookStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'reading', label: 'Reading' },
  { key: 'completed', label: 'Completed' },
  { key: 'on_hold', label: 'On Hold' },
  { key: 'dropped', label: 'Dropped' },
]

const STATUS_COLOR: Record<BookStatus, 'primary' | 'success' | 'warning' | 'danger'> = {
  reading: 'primary',
  completed: 'success',
  on_hold: 'warning',
  dropped: 'danger',
}

export default function BookListPage() {
  const dispatch = useAppDispatch()
  const { items, loading, error, filter } = useAppSelector(s => s.books)
  const [search, setSearch] = useState('')

  useEffect(() => { dispatch(fetchBooks()) }, [dispatch])

  const visible = useMemo(() =>
    items
      .filter(b => filter === 'all' || b.status === filter)
      .filter(b => search === '' || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())),
    [items, filter, search],
  )

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" color="secondary" /></div>
  if (error) return <p className="text-danger text-center py-10">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs selectedKey={filter} onSelectionChange={k => dispatch(setFilter(k as BookStatus | 'all'))} aria-label="Filter by status" color="secondary" variant="underlined">
          {STATUS_TABS.map(t => <Tab key={t.key} title={t.label} />)}
        </Tabs>
        <Input placeholder="Search title or author…" value={search} onValueChange={setSearch} className="max-w-xs" isClearable onClear={() => setSearch('')} variant="bordered" />
      </div>

      {visible.length === 0 ? (
        <p className="text-default-400 text-center py-16">No books found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map(book => (
            <Card key={book.id} isPressable isBlurred as={Link} to={`/books/${book.id}`} className="h-full">
              <CardBody className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold line-clamp-2">{book.title}</p>
                    <p className="text-small text-default-500">{book.author}</p>
                  </div>
                  <Chip size="sm" color={STATUS_COLOR[book.status]} variant="flat" className="shrink-0">
                    {book.status.replace('_', ' ')}
                  </Chip>
                </div>
              </CardBody>
              <CardFooter className="flex-col items-start gap-1">
                <p className="text-small text-default-500">
                  Chapter {book.current_chapter}{book.total_chapters ? ` / ${book.total_chapters}` : ''}
                </p>
                {book.total_chapters && (
                  <Progress size="sm" value={(book.current_chapter / book.total_chapters) * 100} color={STATUS_COLOR[book.status]} className="w-full" aria-label="Progress" />
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {visible.length > 0 && <p className="text-small text-default-400 text-right">{visible.length} book{visible.length !== 1 ? 's' : ''}</p>}
    </div>
  )
}
