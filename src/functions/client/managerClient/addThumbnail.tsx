'use client'

export default async function addThumbnail(uid: string, file: File){

    const data = new FormData()
    data.set('uid', uid)
    data.set('file', file as File)

    const result = await fetch(`/api/thumbnail/add`, {
        method: 'POST',
        body: data
    })
        .then(res => res.json())
        .then(json => json.data)

    return result
}