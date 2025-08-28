'use client'

import { Navbar, NavbarContent } from "@heroui/react"
import { Dispatch, SetStateAction } from "react"

type SubHeaderProps = {
  modeledByList: string[]
  annotatedByList: string[]
  modeler: string
  setSelectedModeler: Dispatch<SetStateAction<string>>
  annotator: string
  setSelectedAnnotator: Dispatch<SetStateAction<string>>
}

export default function SubHeader(props: SubHeaderProps) {

  const modeledByList: string[] = props.modeledByList
  const annotatedByList: string[] = props.annotatedByList

  return <Navbar isBordered className="z-0 w-full bg-[#00856A] dark:bg-[#212121]">
    <NavbarContent>
      <div className="flex w-full gap-4 justify-center lg:justify-end">

        <select
          aria-label='Filter by Annotator'
          className={`min-w-[166px] w-fit max-w-[200px] rounded-xl dark:bg-[#27272a] dark:hover:bg-[#43434a] h-[40px] text-[14px] px-2 outline-[#004C46]`}>
          <option value={'SPRING25'} aria-label={'SPRING25'} selected>Spring '25</option>
        </select>

        <select
          aria-label='Filter by 3D Modeler'
          value={props.modeler}
          onChange={e => props.setSelectedModeler(e.target.value)}
          className={`min-w-[166px] w-fit max-w-[200px] rounded-xl dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[40px] text-[14px] px-2 outline-[#004C46]`}>
          <option value="All" disabled>Modeled by</option>
          {modeledByList.map(modeler => <option key={modeler} value={modeler} aria-label={modeler}>{modeler}</option>)}
        </select>

        <select
          aria-label='Filter by Annotator'
          value={props.annotator}
          onChange={e => props.setSelectedAnnotator(e.target.value)}
          className={`min-w-[166px] w-fit max-w-[200px] rounded-xl dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[40px] text-[14px] px-2 outline-[#004C46]`}>
          <option value="All" disabled>Annotated by</option>
          {annotatedByList.map(annotator => <option key={annotator} value={annotator} aria-label={annotator}>{annotator}</option>)}
        </select>

      </div>
    </NavbarContent>
  </Navbar>
}