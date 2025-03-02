"use client"

import Navbar from "@/components/Navbar"

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // const [userThread, setUserThread] = useState<UserThread | null>(null)

  // useEffect(() => {
  //   const fetchUserThread = async () => {
  //     const returnedUserThread = await getUserThread()

  //     if (!returnedUserThread) toast.error("No user thread found.")
  //   }
  //   fetchUserThread()
  // }, [])
  return (
    <div className="flex flex-col w-full h-full">
      <Navbar />
      {children}
    </div>
  )
}
