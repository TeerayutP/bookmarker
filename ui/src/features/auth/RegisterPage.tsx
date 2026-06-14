import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardBody, Input, Button } from '@heroui/react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { register, login, clearError } from './authSlice'

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((s) => s.auth)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => () => { dispatch(clearError()) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await dispatch(register({ username, email, password }))
    if (register.fulfilled.match(result)) {
      await dispatch(login({ username, password }))
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-violet-50 to-rose-100 p-4">
      <Card className="w-full max-w-sm bg-white/60 backdrop-blur-md border border-white/40 shadow-xl">
        <CardBody className="p-8 gap-6 flex flex-col">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Create account</h1>
            <p className="text-sm text-gray-500 mt-1">Start tracking your reading</p>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Username"
              value={username}
              onValueChange={setUsername}
              variant="bordered"
              isRequired
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onValueChange={setEmail}
              variant="bordered"
              isRequired
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onValueChange={setPassword}
              variant="bordered"
              isRequired
            />
            <Button type="submit" color="primary" isLoading={loading} fullWidth>
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
