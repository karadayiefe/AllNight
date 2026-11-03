import { useEffect, useState } from 'react'
import './App.css'
import { Palette } from 'lucide-react'

function App() {
  const [isDark, setIsDark] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.allNight.getTheme().then((theme) => {
      setIsDark(theme === 'dark')
      setLoading(false)
    })
  }, [])

  async function toggleTheme() {
    const newTheme = isDark ? 'light' : 'dark'

    await window.allNight.setTheme(newTheme)

    setIsDark(newTheme === 'dark')
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="logo">AllNight</h1>

        <div className="nav-item">
          <Palette size={18} />
          <span>Appearance</span>
        </div>

        <div className="sidebar-footer">
          <p>Version 0.1 ~Efe Karadayı</p>
        </div>
      </aside>

      <main className="main">
        <h1 className="page-title">Appearance</h1>

        <div className="settings-card">
          <h2>Windows Theme</h2>

          <div className="theme-row">
            <div>
              <h3>Dark Mode</h3>
              <p>
                {loading ? 'Loading...' : isDark ? 'Enabled' : 'Disabled'}
              </p>
            </div>

            <button
              className={`theme-switch ${isDark ? 'active' : ''}`}
              onClick={toggleTheme}
              disabled={loading}
            >
              <span />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App