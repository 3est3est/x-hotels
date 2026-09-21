import { useState, type FormEvent } from 'react'
import { ErrorState } from '../components/StateMessages'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label, LabelText } from '../components/ui/label'
import { authClient, useSession } from '../lib/auth'
import { useT } from '../lib/i18n'

export default function ProfilePage() {
  const t = useT()
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
      setNameMessage(response.error.message ?? t.profile.nameFailed)
      return
    }
    await refetch()
    setNameMessage(t.profile.nameSaved)
  }

  async function onChangePassword(event: FormEvent) {
    event.preventDefault()
    setPasswordMessage(null)
    setPasswordError(null)
    setPasswordPending(true)
    const response = await authClient.changePassword({ currentPassword, newPassword })
    setPasswordPending(false)
    if (response.error) {
      setPasswordError(response.error.message ?? t.profile.changeFailed)
      return
    }
    setCurrentPassword('')
    setNewPassword('')
    setPasswordMessage(t.profile.changed)
  }

  return (
    <div className="rise mx-auto flex w-full max-w-lg flex-col gap-8 py-2">
      <div>
        <h1 className="font-display text-5xl font-semibold tracking-tight">{t.profile.title}</h1>
        <p className="mt-2 text-stone">{session?.user?.email}</p>
      </div>

      <Card className="flex flex-col gap-4 p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold tracking-tight">{t.profile.nameTitle}</h2>
        {nameMessage && <p className="text-sm text-stone">{nameMessage}</p>}
        <form onSubmit={onSaveName} className="flex flex-col gap-3">
          <Label>
            <LabelText>{t.profile.name}</LabelText>
            <Input
              value={currentName}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              required
            />
          </Label>
          <Button type="submit" variant="dark" disabled={namePending} className="self-start">
            {namePending ? t.profile.saving : t.profile.saveName}
          </Button>
        </form>
      </Card>

      <Card className="flex flex-col gap-4 p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold tracking-tight">{t.profile.passwordTitle}</h2>
        {passwordMessage && <p className="text-sm text-stone">{passwordMessage}</p>}
        {passwordError && <ErrorState message={passwordError} />}
        <form onSubmit={onChangePassword} className="flex flex-col gap-3">
          <Label>
            <LabelText>{t.profile.current}</LabelText>
            <Input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </Label>
          <Label>
            <LabelText>{t.profile.new}</LabelText>
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
            {passwordPending ? t.profile.changing : t.profile.change}
          </Button>
        </form>
      </Card>
    </div>
  )
}
