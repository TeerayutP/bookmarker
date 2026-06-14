import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardBody, Input, Button, Divider } from '@heroui/react'
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
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <p className="text-4xl">📚</p>
          <h1 className="text-3xl font-bold text-violet-700 tracking-tight">Bookmarker</h1>
          <p className="text-default-400 text-sm">Your personal reading tracker</p>
        </div>

        <Card className="bg-white/60 backdrop-blur-md border border-white/50 shadow-xl">
          <CardBody className="p-7 gap-5 flex flex-col">
            <div>
              <h2 className="text-lg font-semibold text-default-800">Create account</h2>
              <p className="text-xs text-default-400 mt-0.5">Start tracking your reading today.</p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input label="Username" value={username} onValueChange={setUsername} variant="bordered" isRequired autoComplete="username" />
              <Input label="Email" type="email" value={email} onValueChange={setEmail} variant="bordered" isRequired autoComplete="email" />
              <Input label="Password" type="password" value={password} onValueChange={setPassword} variant="bordered" isRequired autoComplete="new-password" />
              <Button type="submit" color="secondary" isLoading={loading} fullWidth className="mt-1 font-semibold">
                Create account
              </Button>
            </form>

            <Divider />

            <p className="text-center text-sm text-default-400">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
