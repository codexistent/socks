'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {useRouter} from "next/router";
import {Button} from "@/components/ui/button";

const UserDropdown = () => {
    /*const router = useRouter();

    const handleSignOut = async () => {
        router.push("/sign-in");
    }

    const user = { name: 'Sock', email: 'sock@sock.sock' };*/

    return (
        <DropdownMenu>
            <DropdownMenuTrigger /*asChild*/>
                {/*<Button variant="ghost" className="flex items-center gap-3 text-gray-4 hover:text-yellow-500">

                </Button>*/}
                Open
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
export default UserDropdown
