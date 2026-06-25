import '../App.css'
import ProfileMenu from './ProfileMenu'

export default function Header({ wishlistCount, onWishlistClick, activeView, onLogoClick, onLoginClick, onSignOut, user }) {
  return (
    <header className="header">
      <div className="inner">
        <div className="logo">
          <a href="/" className="wordmark" onClick={e => { e.preventDefault(); onLogoClick?.() }}>The Archive</a>
        </div>
        <nav className="nav">
          {user ? (
            <>
              <button
                className={`wishlist-btn ${activeView === 'wishlist' ? 'active' : ''}`}
                onClick={onWishlistClick}
              >
                <HeartIcon filled={activeView === 'wishlist'} />
                Wishlist
                {wishlistCount > 0 && (
                  <span className="badge">{wishlistCount}</span>
                )}
              </button>
              <ProfileMenu user={user} />
            </>
          ) : (
            <button className="login-btn" onClick={onLoginClick}>
              Log In
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}