import { useState, type FormEvent } from 'react'
import { ErrorState } from '../components/StateMessages'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label, LabelText } from '../components/ui/label'
import { authClient, useSession } from '../lib/auth'

export default function ProfilePage() {
  const { data: session, refetch } = useSession()
  const [name, setName] = useState<string | null>(null)
  const [nameMessage, setNameMessage] = useState<string | null>(null)
  const [namePending, setNamePending] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordPending, setPasswordPending] = useState(false)

  const currentName = name ?? session?.user?.name ?? ''

  async function onSaveName(event: FormEvent) {
    event.preventDefault()
    setNameMessage(null)
    setNamePending(true)
    const response = await authClient.updateUser({ name: currentName })
    setNamePending(false)
    if (response.error) {
      setNameMessage(response.error.message ?? 'Could not save the name')
      return
    }
    await refetch()
    setNameMessage('Name saved.')
  }

  async function onChangePassword(event: FormEvent) {
    event.preventDefault()
    setPasswordMessage(null)
    setPasswordError(null)
    setPasswordPending(true)
    const response = await authClient.changePassword({ currentPassword, newPassword })
    setPasswordPending(false)
    if (response.error) {
      setPasswordError(response.error.message ?? 'Could not change the password')
      return
    }
    setCurrentPassword('')
    setNewPassword('')
    setPasswordMessage('Password changed. Use the new one next sign-in.')
  }

  return (
    <div className="rise mx-auto flex w-full max-w-lg flex-col gap-8 py-2">
      <div>
        <h1 className="font-display text-5xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-2 text-stone">{session?.user?.email}</p>
      </div>

      <Card className="flex flex-col gap-4 p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Display name</h2>
        {nameMessage && <p className="text-sm text-stone">{nameMessage}</p>}
        <form onSubmit={onSaveName} className="flex flex-col gap-3">
          <Label>
            <LabelText>Name</LabelText>
            <Input
              value={currentName}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </Label>
          <Button type="submit" variant="dark" disabled={namePending} className="self-start">
            {namePending ? 'Saving…' : 'Save name'}
          </Button>
        </form>
      </Card>

      <Card className="flex flex-col gap-4 p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Password</h2>
        {passwordMessage && <p className="text-sm text-stone">{passwordMessage}</p>}
        {passwordError && <ErrorState message={passwordError} />}
        <form onSubmit={onChangePassword} className="flex flex-col gap-3">
          <Label>
            <LabelText>Current password</LabelText>
            <Input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </Label>
          <Label>
            <LabelText>New password</LabelText>
            <Input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </Label>
          <Button type="submit" variant="dark" disabled={passwordPending} className="self-start">
            {passwordPending ? 'Changing…' : 'Change password'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
