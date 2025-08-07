import Header from '@/components/Header/Header'
import Foot from '@/components/Shared/Foot'

export default function Tutorials() {
    return <>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1'></meta>
        <title>FAQ</title>

        <Header pageRoute='collections' headerTitle='Help' />
        <main className='min-h-[calc(100vh-177px)] flex p-2 items-center flex-col'>
            <p className='text-xl mb-8'>Submit a help ticket</p>
        </main>
        <Foot />
    </>
}