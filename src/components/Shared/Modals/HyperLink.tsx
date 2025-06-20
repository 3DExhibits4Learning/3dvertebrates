import { forwardRef, LegacyRef, SetStateAction, Dispatch } from "react"
import { Button } from "@heroui/react"

const HyperlinkModal = forwardRef((props: { selectionText?: string, setHyperLinkUrl: Dispatch<SetStateAction<string>>, hyperlinkWrapper: Function, setSelectionText: Dispatch<SetStateAction<string>> }, ref) => {

    const closeDialog = () => {
        props.setSelectionText('')
        if (typeof window !== 'undefined') (document.getElementById('hyperlinkComponent') as HTMLDialogElement).close()
    }

    return <dialog id='hyperlinkComponent' className='bg-[#212121] rounded-xl p-4' ref={ref as LegacyRef<HTMLDialogElement>}>
        <section>

            {
                !props.selectionText &&
                <section className="">
                    <p className="text-white">Select text in the annotation field to insert hyperlink</p>
                    <div className="flex w-full justify-center mt-8">
                        <Button className='bg-[#00856A] text-white' onClick={closeDialog}>OK</Button>
                    </div>
                </section>
            }

            {
                props.selectionText &&
                <>
                    <div>Link:
                        <input
                            type='text'
                            className="w-4/5 min-w-[300px] rounded-xl mb-4 dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[42px] px-4 outline-[#004C46] text-[#004C46] dark:text-white ml-2"
                            onChange={e => props.setHyperLinkUrl(e.target.value)}>
                        </input>
                    </div>

                    <section className="flex justify-around">
                        <div>
                            <Button className='bg-[#004C46]' onClick={() => props.hyperlinkWrapper()}>Insert Link</Button>
                        </div>
                        <div>
                            <Button variant='light' onClick={closeDialog}>Cancel</Button>
                        </div>
                    </section>
                </>
            }

        </section>
    </dialog>
})

HyperlinkModal.displayName = 'HyperlinkModal'
export default HyperlinkModal