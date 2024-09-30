import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  // Una lista di tutte le lingue supportate
  locales: ['en', 'it'],

  // Se questo è vero, verrà usato il percorso come prefisso per le lingue
  // Per esempio: '/it/about' e '/en/about'
  localePrefix: 'always',

  // La lingua di default
  defaultLocale: 'en',
})

export const config = {
  // Definisce quali percorsi devono essere gestiti dal middleware
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
