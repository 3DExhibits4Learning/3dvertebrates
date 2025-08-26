'use client'

import { sendHelpTicketEmail } from "@/functions/server/email"
import { useState } from "react"

const topics = [
    "General Question",
    "Create 3D Vertebrate",
    "Annotation Help",
    "Account Issue",
    "Bug Report",
    "Other"
]

export default function HelpTicket() {
    const [topic, setTopic] = useState("")
    const [message, setMessage] = useState("")

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault()
        await sendHelpTicketEmail('ab632@humboldt.edu', topic, message)
        setTopic("")
        setMessage("")
    }

    return <form className="w-1/3 mx-auto p-12 rounded shadow border border-[#004C46] dark:border-[#F5F3E7]" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">Submit a Help Ticket</h2>
        <label className="block mb-2 font-semibold">
            Topic
            <select
                className="block w-full mt-1 mb-4 p-2 border rounded"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                required>
                <option value="" disabled>Select a topic</option>
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
        </label>
        <label className="block mb-2 font-semibold">
            Message
            <textarea
                className="block w-full mt-1 mb-4 p-2 border rounded"
                rows={6}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Describe your issue or question..."
                required/>
        </label>
        <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark">
            Submit Ticket
        </button>
    </form>
}