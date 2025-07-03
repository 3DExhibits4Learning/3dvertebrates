import { expect, test } from 'vitest'
import { getOldUrl, isLocalDevEnv } from '@/functions/server/utils/utils'

test('Development Environment', () => {
    if(process.env.LOCAL_ENV === 'development') expect(isLocalDevEnv()).toBe(true)
    else expect(isLocalDevEnv()).toBe(false)
})

test('Annotation Photo Url Getter', () => {
    const path = '/data/Vertebrates/Annotations/Uid/AnnotationId/ImageName.jpg'
    
    if(isLocalDevEnv()) expect(getOldUrl(path)).toBe('X:' + path)
    else expect(getOldUrl(path)).toBe(path)

    expect(getOldUrl(null)).toBe('')
})