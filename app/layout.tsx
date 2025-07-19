import { Inter } from 'next/font/google'
import './globals.css'

export const metadata = {
  title: 'ASR Evlauation Preview',
  description: 'Store, And preview ASR evaluation results',
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>{children}</body>
    </html>
  )
}
