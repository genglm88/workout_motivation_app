"use client" // Required for using hooks like usePathname

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center justify-between p-4 bg-indigo-950 shadow-md">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-bold text-indigo-100">
          Health AI
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <Link
          href="/chat"
          className={` text-indigo-50 font-semibold hover:text-indigo-300 ${
            pathname === "/chat" ? "border-b-2 border-gray-900" : ""
          }`}
        >
          Chat
        </Link>
        <Link
          href="/profile"
          className={` text-indigo-50 font-semibold hover:text-indigo-300 ${
            pathname === "/profile" ? "border-b-2 border-indigo-50" : ""
          }`}
        >
          Profile
        </Link>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              userButtonAvatarBox: "h-10 w-10", // Custom size for the avatar
              userButtonPopoverCard: "shadow-lg", // Add shadow to the dropdown
            },
          }}
        />
      </div>
    </nav>
  )
}
