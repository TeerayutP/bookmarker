import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Input, Button, Card, CardBody, CardHeader } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchCategories, createCategory, updateCategory } from './categoriesSlice'

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function CategoryFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const existing = useAppSelector(s => s.categories.items.find(c => c.id === Number(id)))

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit && !existing) dispatch(fetchCategories())
  }, [isEdit, existing, dispatch])

  useEffect(() => {
    if (existing) { setName(existing.name); setSlug(existing.slug); setSlugTouched(true) }
  }, [existing])

  const handleNameChange = (val: string) => {
    setName(val)
    if (!slugTouched) setSlug(toSlug(val))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit && id) {
        await dispatch(updateCategory({ id: Number(id), data: { name, slug } })).unwrap()
      } else {
        await dispatch(createCategory({ name, slug })).unwrap()
      }
      navigate('/categories')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card isBlurred className="max-w-lg mx-auto">
      <CardHeader><h1 className="text-xl font-bold">{isEdit ? 'Edit Category' : 'Add Category'}</h1></CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={name} onValueChange={handleNameChange} isRequired variant="bordered" />
          <Input
            label="Slug"
            value={slug}
            onValueChange={v => { setSlug(v); setSlugTouched(true) }}
            isRequired
            variant="bordered"
            description="URL-friendly identifier, auto-generated from name"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="flat" onPress={() => navigate('/categories')}>Cancel</Button>
            <Button type="submit" color="secondary" isLoading={loading}>{isEdit ? 'Save' : 'Add Category'}</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
