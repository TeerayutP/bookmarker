import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardBody, Button, Spinner, Chip } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCategories, deleteCategory } from './categoriesSlice'

export default function CategoryListPage() {
  const dispatch = useAppDispatch()
  const { items, loading, error } = useAppSelector(s => s.categories)

  useEffect(() => { dispatch(fetchCategories()) }, [dispatch])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" color="secondary" /></div>
  if (error) return <p className="text-danger text-center py-10">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button as={Link} to="/categories/new" color="secondary">+ Add Category</Button>
      </div>

      {items.length === 0 ? (
        <p className="text-default-400 text-center py-16">No categories yet.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {items.map(cat => (
            <Card key={cat.id} isBlurred className="w-full sm:w-auto sm:min-w-48">
              <CardBody className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{cat.name}</p>
                    <p className="text-small text-default-400">/{cat.slug}</p>
                  </div>
                  <Chip size="sm" variant="flat" color="primary">category</Chip>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button as={Link} to={`/categories/${cat.id}`} size="sm" variant="flat" color="secondary">Edit</Button>
                  <Button size="sm" variant="flat" color="danger" onPress={() => dispatch(deleteCategory(cat.id))}>Delete</Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
      {items.length > 0 && <p className="text-small text-default-400 text-right">{items.length} categor{items.length !== 1 ? 'ies' : 'y'}</p>}
    </div>
  )
}
