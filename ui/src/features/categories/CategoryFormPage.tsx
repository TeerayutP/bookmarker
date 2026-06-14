import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Input, Button, Card, CardBody } from '@heroui/react'
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
    <div className="max-w-lg mx-auto">
      <Button variant="light" size="sm" className="mb-4 text-default-500" onPress={() => navigate('/categories')}>
        ← Back to categories
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-default-900">{isEdit ? 'Edit Category' : 'Add Category'}</h1>
        <p className="text-default-400 text-sm mt-1">{isEdit ? 'Update the category details.' : 'Create a new category to organise your books.'}</p>
      </div>

      <Card isBlurred className="border border-white/40 shadow-lg">
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              value={name}
              onValueChange={handleNameChange}
              isRequired
              variant="bordered"
              placeholder="e.g. Science Fiction"
            />
            <Input
              label="Slug"
              value={slug}
              onValueChange={v => { setSlug(v); setSlugTouched(true) }}
              isRequired
              variant="bordered"
              placeholder="e.g. science-fiction"
              startContent={<span className="text-default-400 text-sm">/</span>}
              description="Auto-generated from name. Used as a URL identifier."
            />
            {slug && (
              <div className="flex items-center gap-2 px-3 py-2 bg-default-50 rounded-xl border border-default-100">
                <span className="text-xs text-default-400">Preview:</span>
                <span className="text-xs font-mono text-violet-600 font-medium">/{slug}</span>
              </div>
            )}
            <div className="flex gap-3 justify-end pt-2 border-t border-default-100">
              <Button variant="flat" onPress={() => navigate('/categories')}>Cancel</Button>
              <Button type="submit" color="secondary" isLoading={loading}>
                {isEdit ? 'Save Changes' : 'Add Category'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
