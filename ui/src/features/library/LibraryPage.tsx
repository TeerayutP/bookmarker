import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input, Card, CardBody, Chip, Spinner, Button } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchLibrary } from './librarySlice'
import { addToReadingList } from '../books/booksSlice'
import { resolveImg } from '../../lib/imageUrl'

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
    <div className={`w-full h-full bg-gradient-to-br ${color} flex items-center justify-center`}>
      <span className="text-white font-bold opacity-80 select-none text-4xl">
        {title.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

export default function LibraryPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { items, loading, error } = useAppSelector(s => s.library)
  const myBookIds = useAppSelector(s => new Set(s.books.items.map(b => b.book_id)))
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState<number | null>(null)

  useEffect(() => {
    dispatch(fetchLibrary())
  }, [dispatch])

  const visible = useMemo(() => {
    if (!search) return items
    const term = search.toLowerCase()
    return items.filter(b =>
      b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term)
    )
  }, [items, search])

  const handleAddToList = async (e: React.MouseEvent, bookId: number) => {
    e.stopPropagation()
    setAdding(bookId)
    try {
      await dispatch(addToReadingList(bookId)).unwrap()
    } finally {
      setAdding(null)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" color="secondary" /></div>
  if (error) return <p className="text-danger text-center py-10">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-default-900">Library</h1>
          <p className="text-default-400 text-sm mt-0.5">{items.length} book{items.length !== 1 ? 's' : ''} in the catalogue</p>
        </div>
        <Button as={Link} to="/library/new" color="secondary" variant="flat" size="sm">
          + Add New Book
        </Button>
      </div>

      <Input
        placeholder="Search title or author…"
        value={search}
        onValueChange={setSearch}
        isClearable
        onClear={() => setSearch('')}
        variant="bordered"
        size="sm"
        startContent={<span className="text-default-400 text-sm">🔍</span>}
      />

      {visible.length === 0 ? (
        <div className="text-center py-20 space-y-2">
          <p className="text-5xl">📚</p>
          <p className="text-default-400 font-medium">No books found.</p>
          <Button as={Link} to="/library/new" color="secondary" variant="flat" size="sm">
            Add the first book
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {visible.map(book => {
            const inList = myBookIds.has(book.id)
            return (
              <div
                key={book.id}
                className="cursor-pointer"
                onClick={() => navigate(`/library/${book.id}`)}
              >
                <Card isBlurred className="h-full w-full border border-white/40 shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-0 overflow-hidden w-full">
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
                      {inList && (
                        <div className="absolute top-2 right-2">
                          <Chip size="sm" color="success" variant="solid" className="text-[10px] shadow-md">
                            In My List
                          </Chip>
                        </div>
                      )}
                    </div>

                    <div className="p-3 space-y-2">
                      <div>
                        <p className="font-semibold text-sm line-clamp-2 leading-tight">{book.title}</p>
                        <p className="text-xs text-default-400 mt-0.5 line-clamp-1">{book.author}</p>
                      </div>
                      <div onClick={e => e.stopPropagation()}>
                        {inList ? (
                          <Button
                            as={Link}
                            to="/"
                            size="sm"
                            variant="flat"
                            color="success"
                            fullWidth
                            className="text-xs h-7"
                          >
                            View in My List
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="flat"
                            color="secondary"
                            fullWidth
                            className="text-xs h-7"
                            isLoading={adding === book.id}
                            onPress={e => handleAddToList(e as unknown as React.MouseEvent, book.id)}
                            onClick={e => e.stopPropagation()}
                          >
                            + Add to My List
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
