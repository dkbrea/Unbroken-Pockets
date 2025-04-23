import { redirect } from 'next/navigation'

// Force rebuild - trigger new Vercel deployment
export default function Home() {
  redirect('/landing.html')
}
