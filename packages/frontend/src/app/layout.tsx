import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TODO App',
  description: 'A modern TODO application with real-time updates',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
