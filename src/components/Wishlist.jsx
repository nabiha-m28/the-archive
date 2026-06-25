import ItemCard from './ItemCard'
import '../App.css'

export default function Wishlist({ wishlist, isSaved, onSave, onRemove, onClear, user, onGoToSearch }) {
  if (!user) {
    return (
      <section className="section">
        <div className="empty">
          <p className="empty-title">Log in to view your wishlist</p>
          <button className="search-btn" onClick={onGoToSearch} style={{ marginTop: '1.5rem', maxWidth: '200px' }}>
            Go to Search
          </button>
        </div>
      </section>
    )
  }
  
  if (wishlist.length === 0) {
    return (
      <section className="section">
        <div className="wishlist-header">
          <h2 className="wishlist-title">Your wishlist</h2>
        </div>
        <div className="empty">
          <HeartIcon />
          <p className="empty-title">Nothing saved yet</p>
          <p className="empty-sub">Hit the heart on any listing to save it here.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="wishlist-header">
        <div>
          <h2 className="wishlist-title">Your wishlist</h2>
          <p className="wishlist-meta">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
        </div>
      </div>
      <div className="wishlist-grid">
        {wishlist.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            isSaved={isSaved}
            onSave={onSave}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  )
}

function HeartIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" style={{ color: 'var(--rose)', marginBottom: '1rem' }}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}