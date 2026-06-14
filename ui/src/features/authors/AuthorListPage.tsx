import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardBody, Button, Spinner, Chip } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchAuthors, deleteAuthor } from './authorsSlice'

export default function AuthorListPage() {
  const dispatch = useAppDispatch()
  const { items, loading, error } = useAppSelector(s => s.authors)

  useEffect(() => { dispatch(fetchAuthors()) }, [dispatch])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" color="secondary" /></div>
  if (error) return <p className="text-danger text-center py-10">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Authors</h1>
        <Button as={Link} to="/authors/new" color="secondary">+ Add Author</Button>
      </div>

      {items.length === 0 ? (
        <p className="text-default-400 text-center py-16">No authors yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(author => (
            <Card key={author.id} isBlurred>
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{author.name}</p>
                  <Chip size="sm" variant="flat" color="secondary">author</Chip>
                </div>
                {author.bio && <p className="text-small text-default-500 line-clamp-2">{author.bio}</p>}
                <div className="flex gap-2 pt-1">
                  <Button as={Link} to={`/authors/${author.id}`} size="sm" variant="flat" color="secondary">Edit</Button>
                  <Button size="sm" variant="flat" color="danger" onPress={() => dispatch(deleteAuthor(author.id))}>Delete</Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
      {items.length > 0 && <p className="text-small text-default-400 text-right">{items.length} author{items.length !== 1 ? 's' : ''}</p>}
    </div>
  )
}
