'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'
import { userService } from '@/lib/api/user'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'

export default function SettingsPage() {
  const t = useTranslations('Settings')
  const { user, refreshTokens } = useAuth()
  const { theme, setTheme } = useTheme()

  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const [username, setUsername] = useState(user?.username || '')
  const [monthStartDay, setMonthStartDay] = useState(
    user?.monthStartDay?.toString() || '1'
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setUsername(user.username || '')
      setMonthStartDay(user.monthStartDay?.toString() || '1')
    }
  }, [user])

  const handleUpdateSettings = async () => {
    setIsLoading(true)
    try {
      await userService.update({
        username: username,
        monthStartDay: parseInt(monthStartDay, 10),
      })
      await refreshTokens() // Aggiorna le informazioni dell'utente nel context
      toast({
        title: t('settingsUpdated'),
        description: t('settingsUpdatedDescription'),
      })
    } catch (error) {
      console.error('Error updating settings:', error)
      toast({
        title: t('errorUpdatingSettings'),
        description: t('errorUpdatingSettingsDescription'),
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLanguageChange = (newLocale: string) => {
    const newPath = pathname.replace(/^\/[^\/]+/, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <div className="container mx-auto space-y-8 p-4">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t('accountSettings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="username">{t('username')}</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('usernamePlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor="monthStartDay">{t('monthStartDay')}</Label>
            <Select value={monthStartDay} onValueChange={setMonthStartDay}>
              <SelectTrigger id="monthStartDay">
                <SelectValue placeholder={t('selectMonthStartDay')} />
              </SelectTrigger>
              <SelectContent>
                {[...Array(28)].map((_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleUpdateSettings} disabled={isLoading}>
            {isLoading ? t('updating') : t('updateSettings')}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('appearanceSettings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="darkMode">{t('darkMode')}</Label>
            <Switch
              id="darkMode"
              checked={theme === 'dark'}
              onCheckedChange={(checked: any) =>
                setTheme(checked ? 'dark' : 'light')
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('languageSettings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={locale} onValueChange={handleLanguageChange}>
            <SelectTrigger id="language">
              <SelectValue placeholder={t('selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="it">Italiano</SelectItem>
              {/* Aggiungi altre lingue supportate qui */}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )
}
