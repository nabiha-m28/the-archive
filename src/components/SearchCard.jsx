import { useState, useRef, useEffect } from 'react'
import '../App.css'

const EXAMPLES = [
  'Pucci Capri Pants',
  'Chanel Tweed Jacket',
  'Dior Saddle Bag',
  'Roberto Cavalli Lion Silk Skirt',
  'Balenciaga Le City Bag',
  'Missoni Maxi Dress',
  'Louis Vuitton Neverfull',
  'Herve Ledger Bandage Dress',
]

export default function SearchCard({ onSearch, loading, description, onDescriptionChange }) {
  const [tab, setTab] = useState('text')
  const [imageFile, setImageFile] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [mediaType, setMediaType] = useState('image/jpeg')
  const [dragging, setDragging] = useState(false)
  const [era, setEra] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const fileRef = useRef()
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [isFocused, setIsFocused] = useState(false)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setImageFile(file)
    setMediaType(file.type)
    const reader = new FileReader()
    reader.onload = (e) => setImageBase64(e.target.result.split(',')[1])
    reader.readAsDataURL(file)
  }

  const clearFile = () => {
    setImageFile(null)
    setImageBase64(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = () => {
    if (tab === 'text' && !description.trim()) return
    if (tab === 'image' && !imageBase64) return
    onSearch({ description: tab === 'text' ? description : '', imageBase64, mediaType, era, category, price })
  }

  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (description || isFocused) return;

    const current = EXAMPLES[placeholderIndex];
    let i = 0;
    let typeInterval;

    function startTyping() {
      typeInterval = setInterval(() => {
        i++;
        setTyped(current.slice(0, i));

        if (i === current.length) {
          clearInterval(typeInterval);
          setTimeout(() => {
            setTyped('');
            setPlaceholderIndex((p) => (p + 1) % EXAMPLES.length);
          }, 2500);
        }
      }, 100);
    }

    let startDelay;
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      startDelay = setTimeout(startTyping, 1500);
    } else {
      startTyping();
    }

    return () => {
      clearInterval(typeInterval);
      clearTimeout(startDelay);
    };
  }, [placeholderIndex, description, isFocused]);

  return (
    <div className="search-card">
      <div className="tabs" role="tablist">
      </div>

      {tab === 'text' && (
        <div className="panel">
          <label className="field-label" htmlFor="desc-input">What are you looking for?</label>
          <div className="search-input-row">
            <div className="input-wrapper">
              {!description && !isFocused && (
                <div className="fake-placeholder">
                  {typed}
                  <span className="cursor">|</span>
                </div>
              )}

              <input
                id="desc-input"
                className="text-input"
                type="text"
                value={description}
                onChange={e => onDescriptionChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoComplete="off"
              />
            </div>

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
              aria-label="Search"
            >
              <SearchIcon />
            </button>
          </div>
        </div>
      )}

      {tab === 'image' && (
        <button className="search-btn" onClick={handleSubmit} disabled={loading}>
          <SearchIcon />
          {loading ? 'Searching…' : 'Search the archive'}
        </button>
      )}
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
