import { hyperlinkClass } from '@/tw'

import Header from '@/components/Header/Header'
import Foot from '@/components/Shared/Foot'

export default function FAQPage() {
    return <>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1'></meta>
        <title>FAQ</title>

        <Header pageRoute='collections' headerTitle='Faq' />
        <main className='flex h-full justify-center w-full'>
            <div className='min-h-[calc(100vh-177px)] flex flex-col items-center w-full'>
                <section className='h-full flex flex-col w-1/2 border-x p-8'>
                    <p className='text-5xl mb-16'>FAQ</p>

                    <p className='text-xl mb-1 font-medium'>What's a 'base' model vs an 'annotation' model?</p>
                    <p className='mb-8'>Base models are the primary models of a given species with thumbnails listed on the collections page. Annotation models are used in annotation of base models.
                        Be sure to select the appropriate type when uploading your model.
                    </p>

                    <p className='text-xl mb-1 font-medium'>My first anntoation is retrieving some undesirable/inaccurate data, can I change it?</p>
                    <p className='mb-8'>Yes! Submit a help ticket with subjet 'Metadata,' then provide the problematic metadata field and the data you'd like it to be populated with.</p>

                    <p className='text-xl mb-1 font-medium'>Am I able to add footnotes to my annotations?</p>
                    <p className='mb-8'>Not yet! If you need to cite a specific source, do so in the body of the annotation. Footnotes are a feature that will be coming very soon.</p>

                    <p className='text-xl mb-1 font-medium'>Can I reupload a model?</p>
                    <p className='mb-8'>No, but you can always upload a new model. If you have already completed some annotations, copy/paste them.</p>

                    <p className='text-xl mb-1 font-medium'>Where can I request a new feature in the software?</p>
                    <p className='mb-8'>New feature requests are available as a help ticket subject</p>

                    <p className='text-xl mb-1 font-medium'>Oh no! I think I've found a bug, what should I do?</p>
                    <p className='mb-8'>We'd really, <b>really</b> like to know if you have found a bug! Please submit a help ticket with 'I think I've found a bug' as the subject.</p>

                </section>
            </div>
        </main>
        <Foot />
    </>
}