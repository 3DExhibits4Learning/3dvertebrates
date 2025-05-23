import { annotationDataTransfer} from "@/interface/interface"
import { annotationDataTransferAction, openAnnotationEntryModal, closeAnnotationEntryModal } from "@/interface/actions"

export default function annotationDataTransferReducer(transferState: annotationDataTransfer, action: annotationDataTransferAction): annotationDataTransfer {

    switch (action.type) {

        case 'initialize':

            const openAction = action as openAnnotationEntryModal
            if (!openAction.loadingLabel) throw Error('No label provided')

            return {
                ...transferState,
                transferModalOpen: true,
                transferring: true,
                loadingLabel: openAction.loadingLabel
            }

        case 'terminate':

            const closeAction = action as closeAnnotationEntryModal
            if (!closeAction.result) throw Error('No result provided')

            return {
                ...transferState,
                transferring: false,
                result: closeAction.result
            }

        default:
            console.error(action.type)
            throw Error("Unknown action type")
    }
}