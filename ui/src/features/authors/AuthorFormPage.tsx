import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Input, Textarea, Button, Card, CardBody, CardHeader } from '@heroui/react'
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
    <Card isBlurred className="max-w-lg mx-auto">
      <CardHeader><h1 className="text-xl font-bold">{isEdit ? 'Edit Author' : 'Add Author'}</h1></CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" value={name} onValueChange={setName} isRequired variant="bordered" />
          <Textarea label="Bio" value={bio} onValueChange={setBio} placeholder="optional" variant="bordered" />
          <div className="flex gap-3 justify-end">
            <Button variant="flat" onPress={() => navigate('/authors')}>Cancel</Button>
            <Button type="submit" color="secondary" isLoading={loading}>{isEdit ? 'Save' : 'Add Author'}</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}
