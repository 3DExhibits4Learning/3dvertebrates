import { hyperlinkClass } from '@/tw'

import Header from '@/components/Header/Header'
import Foot from '@/components/Shared/Foot'
import Link from 'next/link'

export default function HowTos() {
    return <>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1'></meta>
        <title>How To&apos;s</title>

        <Header pageRoute='collections' headerTitle='Tutorials' />
        <main className='min-h-[calc(100vh-177px)] flex flex-col items-center'>
            <section className='h-full flex flex-col w-1/2 border-x p-8'>
                <p className='text-5xl mb-16'>How-To&apos;s</p>

                <p className='text-3xl mb-1'>Overview</p>
                <div className='flex flex-col mb-8'>
                    <p>The general overview of the workflow for your 3D Vertebrate is:</p>
                    <ul className='ml-8 mt-4 list-disc list-inside'>
                        <li>You create your 3D Vertebrate</li>
                        <li>You upload your 3D Vertebrate to 3dvertebrates.org</li>
                        <li>Your 3D Vertebrate gets approved and assigned to you for annotation</li>
                        <li>You annotate your 3D Vertebrate</li>
                        <li>Your 3D Vertebrate is published to 3dvertebrates.org</li>
                    </ul>
                    <p className='mt-4'>It&apos;s as simple as that!</p>
                </div>

                <p className='text-3xl mb-1 mt-4'>Creating a 3D Vertebrate</p>
                <div className='flex flex-col mb-8'>
                    <p>Creation of your 3D Vertebrate may be easier than you think. For some specimens, you may be able to create a quality 3D Vertebrate with <b>video</b> from your phone!</p><br></br>
                    <p>If your specimen is larger (roughly the size of a baseball or better) and has fairly simple geometry, we recommend first trying apps such as PhotoCatch. An  excellent example of <i>Aplodontia rufa</i> made
                        with PhotoCatch from the beta test class can be found <span className={hyperlinkClass}><Link href='/collections/Aplodontia%20rufa'>here</Link></span>. If you need to borrow a tripod for your phone,
                        a turntable, etc (and we highly recommend you use these items), create a help ticket to schedule time at the Innovation Hub.</p><br></br>
                    <p>**Note that PhotoCatch is only available on iOS or Mac, but other similar apps are available for other platforms.</p><br></br>
                    <p>If you&apos;re specimen is on the smaller side, has complex geometry or you simply haven&apos;t had luck with beginner apps, then create a help ticket and select &apos;Create 3D Vertebrate&apos; as the topic.
                        You will get to come to the Innovation Hub to use professional photogrammetry equipment to create your 3D Vertebrate.
                        Note that you will need a block of at least <b>three hours</b> to create your 3D Vertebrate.
                    </p>
                </div>

                <p className='text-3xl mb-1 mt-4'>Uploading a 3D Vertebrate</p>
                <div className='flex flex-col mb-8'>
                    <p>Uploading a 3D Vertebrate is pretty straightforward. From your avatar, select &apos;3D Models.&apos; Click &apos;Submit Model&apos; at the top of the page and fill out the form.</p><br></br>
                    <p>**Note - &apos;Base models&apos; are models that are to be annotated, and &apos;annotation models&apos; are models that will be used as annotations for the base model.</p>
                </div>

                <p className='text-3xl mb-1 mt-4'>Annotation of a 3D Vertebrate</p>
                <div className='flex flex-col mb-8'>
                    <p>An annotation is a a note of explanation or comment added to a 3D model. It could explain or elaborate on any aspect of your 3D Vertebrate.
                        You can italicize text with the Italic button (or just press Ctrl+I), or embed hyperlinks with the link button.
                    </p><br></br>
                        <p>When you have completed enough annotations, a &apos;Mark as Annotated&apos; button will appear. This is how you mark your 3D Vertebrate as complete and ready for publication.
                            The first annotation is always the metadata for the 3D Vertebrate itself, which is automatically retrieved.
                        After the first annotation, there are four types of annotations to choose from: text, photo, video or model. </p>
                    <ul className='ml-8 mt-4 list-disc list-inside'>

                        <li className='text-xl'>First Annotation</li>
                        <p className='ml-12'>For the first annotation, all that needs to be done is placement of the annotation marker. From the annotation portal, click &apos;New Annotation&apos;
                            and click the 3D Vertebrate where you want the annotation marker to be placed. The metadata will automatically be retrieved and displayed in the annotation portal
                            when the marker is clicked on the collections page (or in preview mode). Click &apos;Create Annotation&apos; to save the annotation and you&apos;re done!</p>

                        <li className='text-xl mt-4'>Text Annotation</li>
                        <p className='ml-12'>By special request of our original beta testing class Spring &apos;25! These are the simplest annotations, simply add text and you&apos;re good to go (200 character minimum).</p>

                        <li className='text-xl mt-4'>Photo Annotation</li>
                        <p className='ml-12'>Naturally, photo annotations require a photo, and that photo must be licensed under creative commons or be part of the public domain in order to be used. If you decide to create
                            your own photo, you must ascribe one of these licenses to it. If you use a photo from the internet, per creative commons, you must provide the author and the license of the photo on the annotation form.
                            These data are required to be able to use the photo and should be provided on the website where you found it. The title of the photo is also required if it&apos;s provided. The &apos;website&apos; field
                            is optional and can be used as a reference to where you found the photo.
                        </p>
                        <br></br>
                        <p className='ml-12'>The easiest way to find a photo is to use the <span className={hyperlinkClass}><a href='https://search.creativecommons.org/'>Creative Commons Search</a></span> or
                            Google Images with the usage rights filter set to &apos;Creative Commons licenses.&apos; You can find that option under &apos;Tools&apos; in the Google Images search bar.
                        </p>
                        <br></br>
                        <p className='ml-12'>Your photo will appear at the largest size possible in its natural aspect ratio, so always try to find
                            the largest example of the photo you want to use. Avoid thumbnails or small images whenever possible.</p>

                        <li className='text-xl mt-4'>Video Annotation</li>
                        <p className='ml-12'>Video annotations can be added by filling out the form. Annotation text (also by request of our original beta testers!) is optional.</p>

                        <li className='text-xl mt-4'>Model Annotation</li>
                        <p className='ml-12'>Yes, you can use a 3D Vertebrate to annotate another 3D Vertebrate! To achieve such a task, create a 3D Vertebrate and be sure to select &apos;annotation model&apos; when
                            doing so. Then, when you create the annotation, select the model you want to use as an annotation from the dropdown menu.
                        </p>
                    </ul>
                </div>

            </section>
        </main>
        <Foot />
    </>
}