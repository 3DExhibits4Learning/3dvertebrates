'use client'

export default async function removeStudent(email: string) {
    
    const result = await fetch('/api/admin/student', {
        method: 'DELETE',
        body: JSON.stringify({ email: email })
    })
        .then(res => res.json())
        .then(json => json.data)

    return result
}