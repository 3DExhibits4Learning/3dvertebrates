import { forwardRef, LegacyRef, SetStateAction, Dispatch } from "react"

const HyperlinkModal = forwardRef((props: { selectionText?: string, setHyperLinkUrl: Dispatch<SetStateAction<string>>, hyperlinkWrapper: Function, setSelectionText: Dispatch<SetStateAction<string>> }, ref) => {

    const closeDialog = () => {
        props.setSelectionText('')
        if (typeof window !== 'undefined') {
            (document.getElementById('hyperlinkComponent') as HTMLDialogElement).close()
        }
    }

    return <dialog id='hyperlinkComponent' className='rounded-xl p-8' ref={ref as LegacyRef<HTMLDialogElement>}>
        <section>

            {
                !props.selectionText &&
                <section>
                    <p>Select text to insert hyperlink</p>
                    <div className="flex w-full justify-center mt-8">
                        <button onClick={closeDialog}>Close</button>
                    </div>
                </section>
            }

            {
                props.selectionText &&
                <>
                    <div>Link:
                        <input
                            type='text'
                            className="`w-4/5 min-w-[300px] rounded-xl mb-4 dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[42px] px-4 outline-[#004C46] text-[#004C46] dark:text-white"
                            onChange={e => props.setHyperLinkUrl(e.target.value)}>
                        </input>
                    </div>

                    <section className="flex justify-between">
                        <div>
                            <button onClick={() => props.hyperlinkWrapper()}>Insert Link</button>
                        </div>
                        <div>
                            <button onClick={closeDialog}>Cancel</button>
                        </div>
                    </section>
                </>
            }

        </section>
    </dialog>
})

HyperlinkModal.displayName = 'HyperlinkModal'
export default HyperlinkModal