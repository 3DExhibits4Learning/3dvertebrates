import Header from '@/components/Header/Header'
import Foot from '@/components/Shared/Foot'

export default function FAQPage() {
    return <>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1'></meta>
        <title>FAQ</title>

        <Header pageRoute='inaturalist' headerTitle='About' />
        <main className='min-h-[calc(100vh-177px)] flex p-2 items-center flex-col'>
            <p className='text-xl mb-8'>FAQ</p>
        </main>
        <Foot />
    </>
}