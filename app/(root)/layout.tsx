import React from 'react'
import Header from "@/components/Header";
import {auth} from "@/lib/better-auth/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";

const Layout = async ({ children }: { children : React.ReactNode }) => {
    const h = await headers();
    const session = await auth.api.getSession({ headers: await headers() })

    if(!session?.user) redirect('/sign-in')
    if(!session.user.country) redirect('/onboarding');

    const accounts = await auth.api.listUserAccounts({ headers: h });

    const user = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        hasGoogle: accounts.some((a) => a.providerId === 'google'),
    }

    return (
        <main className="min-h-screen text-gray-400">
            <Header user={user}/>
            <div className="container py-10">
                { children }
            </div>
        </main>
    )
}
export default Layout
