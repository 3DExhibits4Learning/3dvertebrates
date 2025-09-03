'use client'

import ManagerClient from "@/components/Admin/Administrator/ManagerClient"
import { ManagerClientProps } from "@/interface/interface"
import { memo } from "react"

export default function ManagerClientWrapper(props: ManagerClientProps){
    const ManagerClientMemo = memo(() => <ManagerClient {...props} />)
    ManagerClientMemo.displayName = 'ManagerClientMemo'
    console.log('ManagerClientWrapper rendered')
    return <ManagerClientMemo />
}