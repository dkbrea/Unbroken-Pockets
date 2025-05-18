export default function SignUp() {
  return (
    <main className="h-screen w-full flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
        <form className="flex flex-col items-center">
          <input type="email" placeholder="Email" className="mb-2 px-4 py-2 rounded text-black" />
          <input type="password" placeholder="Password" className="mb-2 px-4 py-2 rounded text-black" />
          <input type="password" placeholder="Confirm Password" className="mb-4 px-4 py-2 rounded text-black" />
          <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded">Sign Up</button>
        </form>
        <p className="mt-4">Already have an account? <a href="/auth/signin" className="text-blue-400 underline">Sign in</a></p>
      </div>
    </main>
  )
} 