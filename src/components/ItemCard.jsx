import { useState } from 'react'
import '../App.css'

export default function ItemCard({ item, isSaved, onSave, onRemove, user, onLoginClick }) {
  const saved = isSaved(item.id)
  const [hovered, setHovered] = useState(false)

  return (
    <div className="item-card">
      <div className="img-placeholder" aria-hidden="true">
        {item.image ? (
          <img src={item.image} alt="" className="item-img" />
        ) : (
          <HangerIcon />
        )}
        <button
          className={`save-btn ${saved ? 'saved' : ''}`}
          onClick={() => {
            if (!user) {
              onLoginClick()
              return
            }
            if (saved) {
              onRemove(item.id)
            } else {
              onSave(item)
              setHovered(false)
            }
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          title={saved ? 'Remove' : 'Save'}
        >
          {saved && hovered ? <CloseIcon /> : <HeartIcon filled={saved} />}
        </button>
      </div>
      <div className="body">
        {item.era && <p className="era">{item.era}</p>}
        <p className="name">{item.name}</p>
        <p className="detail">
          {item.source}{item.condition ? ` · ` : ''}
          {item.condition && <span className="condition">{item.condition}</span>}
        </p>
        {item.notes && <p className="notes">{item.notes}</p>}
        <div className="item-footer">
          <span className="price">{item.price}</span>
          <a className="link" href={item.url} target="_blank" rel="noopener noreferrer">
            View <ExternalIcon />
          </a>
        </div>
      </div>
    </div>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function HangerIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true" style={{ color: 'var(--rose)' }}>
      <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
