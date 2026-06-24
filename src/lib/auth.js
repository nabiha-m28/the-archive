import { supabase } from '../supabase'

export async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
}

export async function signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName }
        }
    })
    if (error) throw error

    const userId = data.user?.id
    if (userId) {
        await supabase.from('profiles').upsert({
            id: userId,
            email,
            name: fullName
        })
    }
}

export async function signOut() {
    await supabase.auth.signOut()
}