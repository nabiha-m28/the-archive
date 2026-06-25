import { useState, useEffect } from 'react'
import Header from './components/Header'
import SearchCard from './components/SearchCard'
import ResultsGrid from './components/ResultsGrid'
import Wishlist from './components/Wishlist'
import { useSearch } from './hooks/useSearch'
import { useWishlist } from './hooks/useWishlist'
import './App.css'
import { useAuth } from './hooks/useAuth'
import LoginPage from './components/LoginPage'

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth()
  const [view, setView] = useState('search')
  const { results, loading, error, search, reset } = useSearch()
  const { wishlist, addItem, removeItem, isSaved, clearAll } = useWishlist(user)
  const [searchDescription, setSearchDescription] = useState('')
  const [showLogin, setShowLogin] = useState(false)

  const handleWishlistClick = () => {
    setView(v => v === 'wishlist' ? 'search' : 'wishlist')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const handleReset = () => {
    reset()
    setView('search')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    if (view === 'wishlist') {
      window.history.pushState(null, '', window.location.href)
    }
  }, [view])

  useEffect(() => {
    const handlePopState = () => {
      if (view === 'wishlist') {
        setView('search')
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [view])

  return (
    <>
      <Header
        wishlistCount={wishlist.length}
        onWishlistClick={handleWishlistClick}
        activeView={view}
        onLoginClick={() => setShowLogin(true)}
        onSignOut={signOut}
        user={user}
        onLogoClick={() => {
          if (view === 'search') {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          } else {
            setView('search')
            window.scrollTo({ top: 0, behavior: 'instant' })
          }
        }}
      />

      <main>
        {view === 'wishlist' ? (
          <div className="page-section">
            <Wishlist
              wishlist={wishlist}
              isSaved={isSaved}
              onSave={addItem}
              onRemove={removeItem}
              onClear={clearAll}
              user={user}
              onGoToSearch={() => {
                setView('search')
                window.scrollTo({ top: 0, behavior: 'instant' })
              }}
            />
          </div>
        ) : (
          <>
            <section className="hero">
              <h1 className="hero-title">The Archive</h1>
              <p className="hero-sub">
                Describe the piece you're looking for, <br />and we'll trace it across resale sources.
              </p>
              <div className="hero-divider">
                <span className="dash"></span>
                <span className="dot"></span>
                <span className="dash"></span>
              </div>
            </section>

            <section className="search-section">
              <SearchCard
                onSearch={search}
                loading={loading}
                description={searchDescription}
                onDescriptionChange={setSearchDescription}
              />
            </section>

            {error && (
              <div className="error" role="alert">{error}</div>
            )}

            {loading && (
              <div className="loading" aria-live="polite">
                <div className="dots">
                  <span /><span /><span />
                </div>
                <p className="loading-text">Searching the archive…</p>
              </div>
            )}

            {results && !loading && (
              <ResultsGrid
                results={results}
                onReset={handleReset}
                isSaved={isSaved}
                onSave={addItem}
                onRemove={removeItem}
                user={user}
                onLoginClick={() => setShowLogin(true)}
              />
            )}

            {!results && !loading && (
              <section className="sellers-section">
                <div className="sellers-inner">
                  <h2 className="sellers-title">Where We Look</h2>
                  <p className="sellers-sub">
                    We search across designer resale sources — <br />from major platforms to independent sellers.
                  </p>
                  <div className="seller-tags">
                    <div className="seller-tags-row">
                      {['The RealReal', 'Vestiaire Collective', 'Fashionphile', 'What Goes Around Comes Around', 'Into Archive'].map(s => (
                        <span key={s} className="seller-tag">{s}</span>
                      ))}
                    </div>
                    <div className="seller-tags-row">
                      {['eBay', 'Poshmark', 'Thredup', 'Sororité', 'Baby Archive', 'Pissed & Broke', '+ more'].map(s => (
                        <span key={s} className="seller-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {showLogin && <LoginPage onClose={() => setShowLogin(false)} />}

    </>
  )
}