export {}

declare global {
  interface Window {
    allNight: {
      getTheme: () => Promise<'dark' | 'light'>
      setTheme: (theme: 'dark' | 'light') => Promise<void>
    }
  }
}