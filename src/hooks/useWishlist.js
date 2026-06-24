import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export function useWishlist(user) {
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    if (user) {
      fetchWishlist()
    } else {
      setWishlist([])
    }
  }, [user])

  const fetchWishlist = async () => {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error) {
      setWishlist(data.map(row => ({ ...row.item_data, id: row.item_id })))
    }
  }

  const addItem = async (item) => {
    if (!user) return
    const { error } = await supabase
      .from('wishlists')
      .insert({ user_id: user.id, item_id: item.id, item_data: item })
    if (!error) setWishlist(prev => [item, ...prev])
  }

  const removeItem = async (itemId) => {
    if (!user) return
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('item_id', itemId)
    if (!error) setWishlist(prev => prev.filter(i => i.id !== itemId))
  }

  const isSaved = (itemId) => wishlist.some(i => i.id === itemId)

  const clearAll = async () => {
    if (!user) return
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
    if (!error) setWishlist([])
  }

  return { wishlist, addItem, removeItem, isSaved, clearAll }
}