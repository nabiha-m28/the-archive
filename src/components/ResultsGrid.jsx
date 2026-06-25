import { useState, useMemo } from 'react'
import ItemCard from './ItemCard'
import '../App.css'

export default function ResultsGrid({ results, onReset, isSaved, onSave, onRemove }) {
  const [sort, setSort] = useState('featured')
  const [price, setPrice] = useState('')
  const parsePrice = (price) => parseFloat((price || '0').replace(/[$,]/g, '')) || 0

  const filtered = results.results.filter(item => {
    if (!price) return true;
    const p = parsePrice(item.price);
    if (price === 'Under $50') return p <= 50;
    if (price === 'Under $200') return p <= 200;
    if (price === 'Under $500') return p <= 500;
    if (price === 'Under $1,000') return p <= 1000;
    return true;
  });

  const sortedResults = useMemo(() => {
    const items = [...filtered]
    if (sort === 'price-low') {
      return items.sort((a, b) => parsePrice(a.price) - parsePrice(b.price))
    }
    if (sort === 'price-high') {
      return items.sort((a, b) => parsePrice(b.price) - parsePrice(a.price))
    }
    return items
  }, [filtered, sort])

  return (
    <section className="section">
      <div className="header-left">
        <div>
          <h2 className="result-title">{results.query_title}</h2>
          <p className="result-meta">{sortedResults.length} {sortedResults.length === 1 ? 'listing' : 'listings'} found</p>
        </div>
        <div className="header-right">
          <select
            className="sort-select"
            value={price}
            onChange={e => setPrice(e.target.value)}
          >
            <option value="">Any price</option>
            <option>Under $50</option>
            <option>Under $200</option>
            <option>Under $500</option>
            <option>Under $1,000</option>
          </select>

          <select
            className="sort-select"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>
      <div className="results-grid">
        {sortedResults.map(item => (
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