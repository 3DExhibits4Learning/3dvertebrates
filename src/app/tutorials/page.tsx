import Header from '@/components/Header/Header'
import Foot from '@/components/Shared/Foot'

export default function Tutorials() {
    return <>
        <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1'></meta>
        <title>FAQ</title>

        <Header pageRoute='collections' headerTitle='Tutorials' />
        <main className='min-h-[calc(100vh-177px)] flex flex-col items-center'>
            <section className='h-full flex flex-col w-1/2 border-x p-8'>
                <p className='text-5xl mb-16'>How-To's</p>

                <p className='text-3xl mb-1'>Overview</p>
                <div className='flex flex-col mb-8'>
                    <p>The general overview of the workflow for your 3D vertebrate is:</p>
                    <ul className='ml-8 mt-4 list-disc list-inside'>
                        <li>You create your 3D Vertebrate</li>
                        <li>You upload your 3D Vertebrate to 3dvertebrates.org</li>
                        <li>Your model gets approved and assigned to you for annotation</li>
                        <li>You annotate your model</li>
                        <li>Your model is published to 3Dvertebrates.org</li>
                    </ul>
                    <p className='mt-4'>It's as simple as that!</p>
                </div>

                <p className='text-3xl mb-1 mt-4'>Creating a 3D Vertebrate</p>
                <div className='flex flex-col mb-8'>
                    <p>Creation of your 3D Vertebrate may be easier than you think!</p><br></br>
                    <p>If you have a larger specimen, say, roughly the size of a baseball or better, you may be able to create a quality 3D Vertebrate with a <b>video</b> from your phone!</p><br></br>
                    <p>If your specimen is larger and has fairly simple geometry, we recommnend first trying apps such as PhotoCatch (PhotoCatch is only available on IOS or Mac). An example of the level of quality
                        that the app can produce can be found here: [Link]</p><br></br>
                    <p>If you're specimen is on the smaller side, has complex geometry or you simply haven't had luck with beginner apps, then create a help ticket and select 'Create 3D Vertebrate' as the subject.
                        You will get to come to the Innovation Hub to use a professional photogrammetry setup to create your 3D vertebrate.
                        Note that you will need a flash drive (at least 50 GB), and a block of at least <b>two hours</b> to create your 3D verterbrate.
                    </p>
                </div>

                <p className='text-3xl mb-1 mt-4'>Uploading a 3D Vertebrate</p>
                <div className='flex flex-col mb-8'>
                    <p>Uploading 3D models is pretty straightforward. From your avatar, select '3D Models.' Click 'Submit Model' at the top of the page and fill out the form.</p><br></br>
                    <p>**Note - 'Base models' are models that are to be annotated, and 'annotation models' are models that will be used as annotations for the base model.
                    </p>
                </div>

                <p className='text-3xl mb-1 mt-4'>Annotation of a 3D Vertebrate</p>
                <div className='flex flex-col mb-8'>
                    <p>An annotation is a a note of explanation or comment added to a 3D model. It could explain or elaborate on any aspect of your 3D vertebrate.
                        The first annotation is always the metadata for the 3D vertebrate itself, which is automatically retrieved.
                        After the first annotation, there are four types of annotations to choose from: text, photo, video or model. </p>
                    <ul className='ml-8 mt-4 list-disc list-inside'>

                        <li className='text-xl'>First Annotation</li>
                        <p className='ml-12'>For the first annotation, all that needs to be done is placement of the annotation marker. From the annotation portal, click 'New Annotation'
                            and click the 3D vertebrate where you want the annotation marker to be placed. The metadata will automatically be retrieved and displayed in the annotation portal
                            when the marker is clicked on the collections page (or in preview mode). Click 'Create Annotation' to save the annotation and you're done!</p>

                        <li className='text-xl mt-4'>Text Annotation</li>
                        <p className='ml-12'>By special request of our original beta testing class Spring '25! These are the simplest annotations, simply add text and you're good to go (200 character minimum).</p>

                        <li className='text-xl mt-4'>Photo Annotation</li>
                        <p className='ml-12'>Naturally, photo annotations require a photo, and that photo must be licensed under creative commons or be part of the public domain in order to be used. If you decide to create
                            your own photo, you must ascribe one of these licenses to it. If you use a photo from the internet, per creative commons, you must provide the author and the license of the photo on the annotation form.
                            These data are required to be able to use the photo and should be provided on the website where you found it. The title of the photo is also required if it's provided. The 'website' field
                            is optional and can be used as a reference to where you found the photo.
                        </p>
                        <br></br>
                        <p className='ml-12'>The easiest way to find a photo is to use the <a href='https://search.creativecommons.org/' className='text-blue-500 underline'>Creative Commons Search</a> or
                            Google Images with the usage rights filter set to 'Creative Commons licenses.' You can find that option under 'Tools' in the Google Images search bar.
                        </p>
                        <br></br>
                        <p className='ml-12'>Your photo will appear at the largest size possible in its natural aspect ratio, so always try to find
                            the largest example of the photo you want to use. Avoid thumbnails or small images whenever possible.</p>

                        <li className='text-xl mt-4'>Video Annotation</li>
                        <p className='ml-12'>Video annotations can be added by filling out the form. Annotation text (also by request of our original beta testers!) is optional.</p>

                        <li className='text-xl mt-4'>Model Annotation</li>
                        <p className='ml-12'>Yes, you can use a 3D Vertebrate to annotate another 3D Vertebrate! To achieve such a task, create a 3D Vertebrate and be sure to select 'annotation model' when
                            doing so. Then, when you create the annotation, select the model you want to use as an annotation from the dropdown menu.
                        </p>
                    </ul>
                </div>

            </section>
        </main>
        <Foot />
    </>
}