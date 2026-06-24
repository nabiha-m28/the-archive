import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export function useAuth() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })
        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return error
    }

    const signUp = async (email, password, name) => {
        const { error } = await supabase.auth.signUp({ email, password })
        if (!error) {
            await supabase.from('profiles').update({ name }).eq('email', email)
        }
        return error
    }

    const signOut = () => supabase.auth.signOut()

    return { user, loading, signIn, signUp, signOut }
}