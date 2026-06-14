import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Input, Textarea, Button, Card, CardBody } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { fetchAuthors, createAuthor, updateAuthor } from './authorsSlice'

export default function AuthorFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const existing = useAppSelector(s => s.authors.items.find(a => a.id === Number(id)))

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit && !existing) dispatch(fetchAuthors())
  }, [isEdit, existing, dispatch])

  useEffect(() => {
    if (existing) { setName(existing.name); setBio(existing.bio ?? '') }
  }, [existing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit && id) {
        await dispatch(updateAuthor({ id: Number(id), data: { name, bio: bio || null } })).unwrap()
      } else {
        await dispatch(createAuthor({ name, bio: bio || null })).unwrap()
      }
      navigate('/authors')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <Button variant="light" size="sm" className="mb-4 text-default-500" onPress={() => navigate('/authors')}>
        ← Back to authors
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-default-900">{isEdit ? 'Edit Author' : 'Add Author'}</h1>
        <p className="text-default-400 text-sm mt-1">{isEdit ? 'Update the author details.' : 'Add a new author to your library.'}</p>
      </div>

      <Card isBlurred className="border border-white/40 shadow-lg">
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Name"
              value={name}
              onValueChange={setName}
              isRequired
              variant="bordered"
              placeholder="Author's full name"
            />
            <Textarea
              label="Bio"
              value={bio}
              onValueChange={setBio}
              placeholder="A short biography… (optional)"
              variant="bordered"
              minRows={4}
            />
            <div className="flex gap-3 justify-end pt-2 border-t border-default-100">
              <Button variant="flat" onPress={() => navigate('/authors')}>Cancel</Button>
              <Button type="submit" color="secondary" isLoading={loading}>
                {isEdit ? 'Save Changes' : 'Add Author'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
