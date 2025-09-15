'use server'

/**
 * @file src\functions\server\email.ts
 * 
 * @fileoverview email functions
 */

// Typical imports
import { transporter } from './utils/transporter'

export async function emailNewlyAddedStudent(email: string, domain: string) {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `${domain} student access`,
        html: `You have been authorized to contribute to ${domain}!
        Remember that you must login with your humboldt.edu email address.
        <br><br>
        You can find the admin portal for login on the contributions page of ${domain}, or click <u><a href="${domain}/contribute" target='_blank'>here</a></u>`
    }).catch(e => {throw Error(e.message)})
}

export async function informStudentOfAssignment(email: string, domain: string) {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `New assignment for ${domain}`,
        html: `You have a new assignment on ${domain}.
        <br><br>
        You can find your assignment at ${domain}/admin/student, remember that you must login with your humboldt.edu email address.`
    }).catch(e => {throw Error(e.message)})
}

export async function sendHelpTicketEmail(email: string, topic: string, message: string) {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Help Ticket Received - ${topic}`,
        html: `New Help Ticket:
        <br><br>
        Topic: ${topic}
        <br>
        Message: ${message}`
    }).catch(e => {throw Error(e.message)})
}