import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Input, Card, CardBody, Chip, Progress, Spinner, Button, ButtonGroup, Select, SelectItem } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchBooks, setFilter, setCategoryFilter, BookStatus } from './booksSlice'
import { fetchAuthors } from '../authors/authorsSlice'
import { fetchCategories } from '../categories/categoriesSlice'
import { resolveImg } from '../../lib/imageUrl'

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

const STATUS_LABEL: Record<BookStatus, string> = {
  reading: 'Reading',
  completed: 'Completed',
  on_hold: 'On Hold',
  dropped: 'Dropped',
}

type ViewMode = 'grid' | 'list'

function CoverPlaceholder({ title, size = 'lg' }: { title: string; size?: 'sm' | 'lg' }) {
  const colors = [
    'from-violet-400 to-purple-600',
    'from-blue-400 to-cyan-600',
    'from-rose-400 to-pink-600',
    'from-amber-400 to-orange-600',
    'from-emerald-400 to-teal-600',
  ]
  const color = colors[title.charCodeAt(0) % colors.length]
  return (
    <div className={`w-full h-full bg-gradient-to-br ${color} flex items-center justify-center`}>
      <span className={`text-white font-bold opacity-80 select-none ${size === 'sm' ? 'text-lg' : 'text-4xl'}`}>
        {title.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

function AuthorLink({ authorName, authors }: { authorName: string; authors: { id: number; name: string }[] }) {
  const a = authors.find(a => a.name.toLowerCase() === authorName.toLowerCase())
  if (a) return (
    <Link
      to={`/authors/${a.id}`}
      className="hover:text-violet-600 hover:underline transition-colors"
      onClick={e => e.stopPropagation()}
    >
      {authorName}
    </Link>
  )
  return <span>{authorName}</span>
}

export default function BookListPage() {
  const dispatch = useAppDispatch()
  const { items, loading, error, filter, categoryFilter } = useAppSelector(s => s.books)
  const authors = useAppSelector(s => s.authors.items)
  const categories = useAppSelector(s => s.categories.items)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<ViewMode>(() =>
    (localStorage.getItem('bookListView') as ViewMode) ?? 'grid'
  )

  const setViewMode = (v: ViewMode) => {
    setView(v)
    localStorage.setItem('bookListView', v)
  }

  useEffect(() => {
    dispatch(fetchBooks())
    dispatch(fetchAuthors())
    dispatch(fetchCategories())
  }, [dispatch])

  const visible = useMemo(() =>
    items
      .filter(b => filter === 'all' || b.status === filter)
      .filter(b => categoryFilter === null || b.category_id === categoryFilter)
      .filter(b => search === '' ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())),
    [items, filter, categoryFilter, search],
  )

  const readingCount = items.filter(b => b.status === 'reading').length
  const completedCount = items.filter(b => b.status === 'completed').length

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" color="secondary" /></div>
  if (error) return <p className="text-danger text-center py-10">{error}</p>

  return (
    <div className="space-y-6">
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Books', value: items.length, color: 'text-violet-700' },
            { label: 'Reading', value: readingCount, color: 'text-blue-600' },
            { label: 'Completed', value: completedCount, color: 'text-emerald-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-2xl px-4 py-3 text-center shadow-sm">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-default-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 items-center">
        <Select
          selectedKeys={[filter]}
          onSelectionChange={k => dispatch(setFilter([...k][0] as BookStatus | 'all'))}
          aria-label="Filter by status"
          variant="bordered"
          size="sm"
          className="w-36"
        >
          {STATUS_TABS.map(t => <SelectItem key={t.key}>{t.label}</SelectItem>)}
        </Select>

        <Select
          placeholder="All categories"
          selectedKeys={categoryFilter !== null ? [String(categoryFilter)] : []}
          onSelectionChange={keys => {
            const val = [...keys][0]
            dispatch(setCategoryFilter(val != null ? Number(val) : null))
          }}
          variant="bordered"
          size="sm"
          className="w-44"
          aria-label="Filter by category"
        >
          {categories.map(c => (
            <SelectItem key={String(c.id)}>{c.name}</SelectItem>
          ))}
        </Select>

        {categoryFilter !== null && (
          <Button size="sm" variant="light" onPress={() => dispatch(setCategoryFilter(null))} className="text-default-400 shrink-0 px-2">
            ✕
          </Button>
        )}

        <div className="flex-1" />

        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search title or author…"
            value={search}
            onValueChange={setSearch}
            className="max-w-xs"
            isClearable
            onClear={() => setSearch('')}
            variant="bordered"
            size="sm"
            startContent={<span className="text-default-400 text-sm">🔍</span>}
          />

          <ButtonGroup size="sm" variant="flat">
            <Button
              isIconOnly
              color={view === 'grid' ? 'secondary' : 'default'}
              onPress={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
                <rect x="1" y="1" width="5.5" height="5.5" rx="1"/>
                <rect x="8.5" y="1" width="5.5" height="5.5" rx="1"/>
                <rect x="1" y="8.5" width="5.5" height="5.5" rx="1"/>
                <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1"/>
              </svg>
            </Button>
            <Button
              isIconOnly
              color={view === 'list' ? 'secondary' : 'default'}
              onPress={() => setViewMode('list')}
              aria-label="List view"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
                <rect x="1" y="2" width="13" height="2" rx="1"/>
                <rect x="1" y="6.5" width="13" height="2" rx="1"/>
                <rect x="1" y="11" width="13" height="2" rx="1"/>
              </svg>
            </Button>
          </ButtonGroup>

          <Button as={Link} to="/books/new" color="secondary" variant="flat" size="sm" className="shrink-0">
            + Add Book
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-20 space-y-2">
          <p className="text-5xl">📚</p>
          <p className="text-default-400 font-medium">No books found.</p>
          <p className="text-default-300 text-sm">Try a different filter or add a new book.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {visible.map(book => (
            <Link key={book.id} to={`/books/${book.id}`} className="group block">
              <Card isPressable isBlurred className="h-full border border-white/40 shadow-sm group-hover:shadow-md transition-shadow">
                <CardBody className="p-0 overflow-hidden">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-xl">
                    {resolveImg(book.cover_url) ? (
                      <img
                        src={resolveImg(book.cover_url)!}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <CoverPlaceholder title={book.title} />
                    )}
                    <div className="absolute top-2 right-2">
                      <Chip size="sm" color={STATUS_COLOR[book.status]} variant="solid" className="text-[10px] shadow-md">
                        {STATUS_LABEL[book.status]}
                      </Chip>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <div>
                      <p className="font-semibold text-sm line-clamp-2 leading-tight">{book.title}</p>
                      <p className="text-xs text-default-400 mt-0.5 line-clamp-1">
                        <AuthorLink authorName={book.author} authors={authors} />
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-default-400">
                        <span>Ch. {book.current_chapter}</span>
                        {book.total_chapters && <span>{Math.round((book.current_chapter / book.total_chapters) * 100)}%</span>}
                      </div>
                      {book.total_chapters && (
                        <Progress size="sm" value={(book.current_chapter / book.total_chapters) * 100} color={STATUS_COLOR[book.status]} aria-label="Progress" />
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(book => {
            const progress = book.total_chapters
              ? Math.round((book.current_chapter / book.total_chapters) * 100)
              : null
            return (
              <Link key={book.id} to={`/books/${book.id}`} className="group block">
                <Card isBlurred className="border border-white/40 shadow-sm group-hover:shadow-md transition-shadow">
                  <CardBody className="p-4">
                    <div className="flex gap-4">
                      {/* Cover */}
                      <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0 shadow-sm">
                        {resolveImg(book.cover_url) ? (
                          <img
                            src={resolveImg(book.cover_url)!}
                            alt={book.title}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        ) : (
                          <CoverPlaceholder title={book.title} size="sm" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-default-900 leading-tight line-clamp-1">{book.title}</p>
                            <p className="text-xs text-default-400 mt-0.5">
                              <AuthorLink authorName={book.author} authors={authors} />
                            </p>
                          </div>
                          <Chip size="sm" color={STATUS_COLOR[book.status]} variant="flat" className="shrink-0 text-[10px]">
                            {STATUS_LABEL[book.status]}
                          </Chip>
                        </div>

                        {book.notes && (
                          <p className="text-xs text-default-500 line-clamp-2 leading-relaxed italic">
                            "{book.notes}"
                          </p>
                        )}

                        <div className="flex items-center gap-3">
                          {book.total_chapters ? (
                            <>
                              <Progress
                                size="sm"
                                value={(book.current_chapter / book.total_chapters) * 100}
                                color={STATUS_COLOR[book.status]}
                                aria-label="Progress"
                                className="flex-1"
                              />
                              <span className="text-[11px] text-default-400 shrink-0">
                                Ch. {book.current_chapter} / {book.total_chapters} · {progress}%
                              </span>
                            </>
                          ) : (
                            <span className="text-[11px] text-default-400">Ch. {book.current_chapter}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {visible.length > 0 && (
        <p className="text-xs text-default-300 text-right">
          {visible.length} book{visible.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
