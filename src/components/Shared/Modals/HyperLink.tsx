import { forwardRef, LegacyRef, MutableRefObject } from "react"

const HyperlinkModal = forwardRef((props: { selectionText?: string}, ref) => {

    return <dialog className='rounded-xl p-8' ref={ref as LegacyRef<HTMLDialogElement>}>
        <section>
            
            {
                !props.selectionText &&
                <div>Text: <input type='text' className="`w-4/5 min-w-[300px] rounded-xl mb-4 dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[42px] px-4 outline-[#004C46] text-[#004C46] dark:text-white"></input></div>
            }

            <div>Link: <input type='text' className="`w-4/5 min-w-[300px] rounded-xl mb-4 dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[42px] px-4 outline-[#004C46] text-[#004C46] dark:text-white"></input></div>

        </section>
    </dialog>
})

HyperlinkModal.displayName = 'HyperlinkModal'
export default HyperlinkModal