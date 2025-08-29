/**
 *@file src/components/Collections/AnnotationModal.tsx

 @fileoverview mobile annotation modal
 */

"use client"

// Typical imports
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@heroui/react"
import { GbifResponse } from "@/interface/interface"

// Default imports
import Herbarium from "@/classes/HerbariumClass"
import FirstMobileAnnotation from "@/components/Collections/Mobile3DExhibit/FirstAnnotation"
import MobilePhotoAnnotation from "@/components/Collections/Mobile3DExhibit/PhotoAnnotation"
import MobileModelAnnotation from "@/components/Collections/Mobile3DExhibit/ModelAnnotation"
import MobileVideoAnnotation from "@/components/Collections/Mobile3DExhibit/VideoAnnotations"
import MobileTextAnnotation from "@/components/Collections/Mobile3DExhibit/TextAnnotation"

// Props interface
interface annotationModalProps {
  specimen: Herbarium
  gMatch: { hasInfo: boolean, data?: GbifResponse }
  title: string;
  index: number | null
  imgSrc: string | null
  imgLoading: boolean
}

// Main JSX
export default function AnnotationModal(props: annotationModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  // Declarations
  const s = props.specimen
  const annotations = props.specimen.annotations.annotations

  return <>
    <Button id="annotationButton" className="hidden" onPress={onOpen}></Button>
    <div id='modalDiv'>
      <Modal className="bg-black text-white justify-center" isOpen={isOpen} onOpenChange={onOpenChange} scrollBehavior={"inside"} size="full" placement="top">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="fade flex gap-1 w-full items-center justify-center"><p className="text-center text-2xl pt-[20px]">{props.title}</p></ModalHeader>

              <ModalBody>
                {props.index === 0 && <FirstMobileAnnotation gMatch={props.gMatch} s={s} />}
                {!!props.index && annotations[props.index - 1].annotation_type === 'photo' && <MobilePhotoAnnotation imgSrc={props.imgSrc} annotations={annotations} imgLoading={props.imgLoading} index={props.index} />}
                {!!props.index && annotations[props.index - 1].annotation_type === 'video' && <MobileVideoAnnotation index={props.index} annotations={annotations} />}
                {!!props.index && annotations[props.index - 1].annotation_type === 'model' && <MobileModelAnnotation index={props.index} annotations={annotations} />}
                {!!props.index && annotations[props.index - 1].annotation_type === 'text' && <MobileTextAnnotation textAnnotation={annotations[props.index - 1].annotation.annotation as string} />}
              </ModalBody>

              <ModalFooter className="justify-center"><Button className="bg-[#004C46] text-white" onPress={onClose}>Close</Button></ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  </>
}
