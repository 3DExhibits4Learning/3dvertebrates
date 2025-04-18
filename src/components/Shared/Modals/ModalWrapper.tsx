import { Modal, ModalContent } from "@nextui-org/react"
import { Dispatch, SetStateAction } from "react"

export default function ModalWrapper(props: {isOpen: boolean, setIsOpen: Dispatch<SetStateAction<boolean>>}){
    return<Modal>
        <ModalContent>
            <div></div>
        </ModalContent>
    </Modal>
}