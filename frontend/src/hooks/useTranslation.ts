// hooks/useTranslation.ts
import { useTranslations } from 'next-intl'

export function useTranslation(namespace: string) {
  const t = useTranslations(namespace)
  return (key: string, params?: Record<string, string | number>) =>
    t(key, params)
}
