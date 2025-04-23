import Link from 'next/link';

/**
 * Layout component for authentication pages that applies the landing page styling
 */
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <>
      {/* Background elements */}
      <div className="dynamic-gradient"></div>
      <div className="fixed top-0 left-0 w-full h-full bg-noise opacity-[0.02] pointer-events-none z-[9997]"></div>
      
      {/* Navigation */}
      <nav className="flex justify-between items-center w-full p-8 z-10 absolute top-0 left-0">
        <Link href="/" className="text-2xl font-semibold text-primary relative">
          Unbroken Pockets
        </Link>
      </nav>

      {/* Auth container */}
      <div className="flex-1 flex justify-center items-center p-8 z-10 relative min-h-screen">
        <div className="w-full max-w-md bg-white rounded-[20px] shadow-lg p-12 relative overflow-hidden transition-all duration-500 hover:translate-y-[-5px] hover:shadow-xl">
          {/* Decorative shapes */}
          <div className="absolute w-[400px] h-[400px] top-[-200px] right-[-200px] rounded-full bg-primary-light/20 blur-[60px]"></div>
          <div className="absolute w-[300px] h-[300px] bottom-[-150px] left-[-150px] rounded-full bg-primary/15 blur-[60px]"></div>

          {/* Auth header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2 gradient-text">{title}</h1>
            <p className="text-text-medium">{subtitle}</p>
          </div>

          {/* Auth content */}
          {children}
        </div>
      </div>
    </>
  );
} 