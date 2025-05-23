'use client';

import { Navbar, NavbarContent } from "@nextui-org/react"
import { Dispatch, SetStateAction } from "react";

type SubHeaderProps = {
  modeledByList: string[]
  annotatedByList: string[]
  modeler: string
  setSelectedModeler: Dispatch<SetStateAction<string>>
  annotator: string
  setSelectedAnnotator: Dispatch<SetStateAction<string>>
}

const SubHeader = (props: SubHeaderProps) => {

  const modeledByList: string[] = props.modeledByList;
  const annotatedByList: string[] = props.annotatedByList;

  return (
    <Navbar isBordered className="z-0 w-full bg-[#00856A] dark:bg-[#212121]">
      <NavbarContent>
        <div className="flex w-full gap-4 justify-center lg:justify-end">
          <select
            value={props.modeler}
            onChange={(e) => props.setSelectedModeler(e.target.value)}
            className={`min-w-[166px] w-fit max-w-[200px] rounded-xl dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[40px] text-[14px] px-2 outline-[#004C46]`}
          >
            <option value="All" disabled selected>Modeled by</option>
            {
              modeledByList.map((modeler: string) => (
                <option key={modeler} value={modeler}>{modeler}</option>
              ))
            }
          </select>

          <select
            value={props.annotator}
            onChange={(e) => props.setSelectedAnnotator(e.target.value)}
            className={`min-w-[166px] w-fit max-w-[200px] rounded-xl dark:bg-[#27272a] dark:hover:bg-[#3E3E47] h-[40px] text-[14px] px-2 outline-[#004C46]`}
          >
            <option value="All" disabled selected>Annotated by</option>
            {
              annotatedByList.map((annotator: string) => (
                <option key={annotator} value={annotator}>{annotator}</option>
              ))
            }
          </select>
        </div>
      </NavbarContent>
    </Navbar>
  )
}

export default SubHeader