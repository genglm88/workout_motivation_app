"use client"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { Toaster } from "sonner"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <body className="antialiased">
          <Toaster
            position="bottom-center"
            theme="light"
            richColors
            className="font-sans"
          />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
