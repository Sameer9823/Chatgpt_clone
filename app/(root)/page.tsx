// app/(root)/page.tsx
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/chat')
}