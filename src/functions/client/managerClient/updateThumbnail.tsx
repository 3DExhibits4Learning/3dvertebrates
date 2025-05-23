'use client'

export default async function updateThumbnail(uid: string, file: File) {
    
    const data = new FormData()
    data.set('uid', uid)
    data.set('file', file as File)

    const result = await fetch(`/api/thumbnail/update`, {
        method: 'POST',
        body: data
    })
        .then(res => res.json())
        .then(json => json.data)

    return result
}


