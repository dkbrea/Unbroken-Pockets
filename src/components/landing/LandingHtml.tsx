import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import '../../styles/landing.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const WORDS = ["unbroken", "organized", "optimized", "simplified"];

const LandingHtml: React.FC = () => {
  // Refs for custom cursor
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  // State for mobile menu
  const [menuOpen, setMenuOpen] = useState(false);
  // State for word rotator
  const [currentWord, setCurrentWord] = useState(0);

  // Word rotator effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % WORDS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Custom cursor movement
  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;
    let mouseX = 0, mouseY = 0;
    let posX = 0, posY = 0;
    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    };
    // TypeScript fix: ensure event type
    // window.addEventListener('mousemove', (e: MouseEvent) => moveCursor(e as MouseEvent));
    const animateFollower = () => {
      posX += (mouseX - posX) * 0.15;
      posY += (mouseY - posY) * 0.15;
      follower.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
      requestAnimationFrame(animateFollower);
    };
    window.addEventListener('mousemove', moveCursor);
    animateFollower();
    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  // GSAP Animations & ScrollTrigger
  useEffect(() => {
    // Animate nav
    gsap.to('.nav', { opacity: 1, duration: 1 });
    // Animate hero
    gsap.to('.main-title', { opacity: 1, y: 0, duration: 1, delay: 0.2 });
    gsap.to('.subtitle', { opacity: 1, y: 0, duration: 1, delay: 0.4 });
    gsap.to('.cta-button', { opacity: 1, y: 0, duration: 1, delay: 0.6 });
    // Animate features
    gsap.utils.toArray('.feature-item').forEach((el: any, i: number) => {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.8, delay: 0.8 + i * 0.1 });
    });
    // Animate CTA
    gsap.to('.cta-section', { opacity: 1, duration: 1, delay: 1.5 });
    // Animate gallery
    gsap.to('.gallery-section', { opacity: 1, duration: 1, delay: 1.7 });
    // Animate finance-preview
    gsap.to('.finance-preview', { opacity: 1, y: 0, duration: 1, delay: 2 });
    // Animate side nav
    gsap.to('.side-nav', { opacity: 1, duration: 1, delay: 2.2 });
    // Progress bar scroll
    const handleScroll = () => {
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollTop = window.scrollY;
      const percent = Math.min(100, (scrollTop / docHeight) * 100);
      gsap.to('.progress-bar', { width: percent + '%', duration: 0.2, ease: 'power2.out' });
    };
    window.addEventListener('scroll', handleScroll);
    // Reveal on scroll
    gsap.utils.toArray('.reveal-on-scroll').forEach((el: any) => {
      gsap.fromTo(el, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, scrollTrigger: {
          trigger: el,
          start: 'top 80%',
        },
      });
    });
    // Magnetic button effect
    const magneticBtns = document.querySelectorAll('.magnetic-button');
    magneticBtns.forEach((btn) => {
      btn.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        (e.target as HTMLElement).style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      btn.addEventListener('mouseleave', (e: MouseEvent) => {
        (e.target as HTMLElement).style.transform = '';
      });
    });
    // Gallery/card hover lift
    const liftEls = document.querySelectorAll('.feature-item, .gallery-item');
    liftEls.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        (el as HTMLElement).style.transform = 'translateY(-10px) scale(1.03)';
      });
      el.addEventListener('mouseleave', () => {
        (el as HTMLElement).style.transform = '';
      });
    });
    // Scroll indicator animation
    gsap.to('.scroll-indicator', { opacity: 1, y: 0, duration: 1, delay: 1 });
    // Side nav dot active state
    const sections = ['hero', 'features', 'gallery', 'cta'];
    const navDots = document.querySelectorAll('.nav-dot');
    const onScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 2;
      sections.forEach((id, idx) => {
        const sec = document.getElementById(id);
        if (sec) {
          const { top, height } = sec.getBoundingClientRect();
          const absTop = window.scrollY + top;
          if (scrollPos >= absTop && scrollPos < absTop + height) {
            navDots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
          }
        }
      });
    };
    window.addEventListener('scroll', onScroll);
    // Nav dot click scroll
    navDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        const sec = document.getElementById(sections[idx]);
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
      });
    });
    // Mobile menu logic
    const menuBtn = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        document.body.classList.toggle('menu-open');
      });
    }
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Unbroken Pockets - Master Your Money System</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <div className="progress-bar" />
      <div className="custom-cursor" ref={cursorRef} />
      <div className="cursor-follower" ref={followerRef} />
      <div className="dynamic-gradient" />
      <div className="noise-overlay" />
      <canvas id="particles-canvas"></canvas>
      {/* Side navigation dots */}
      <div className="side-nav">
        <div className="nav-dot active" data-section="hero"></div>
        <div className="nav-dot" data-section="features"></div>
        <div className="nav-dot" data-section="gallery"></div>
        <div className="nav-dot" data-section="cta"></div>
      </div>
      {/* Navigation */}
      <nav className="nav">
        <div className="logo">Unbroken Pockets</div>
        <button className="mobile-menu-button" aria-label="Open navigation menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="nav-links">
          <div className="nav-link">Features</div>
          <div className="nav-link">Screenshots</div>
          <div className="nav-link">Pricing</div>
          <div className="nav-link">Support</div>
          <div className="auth-buttons">
            <a href="/auth/signin" className="sign-in-button">Sign In</a>
            <a href="/auth/signup" className="sign-up-button">Sign Up</a>
          </div>
        </div>
      </nav>
      {/* Main container */}
      <div className="container">
        {/* Hero section */}
        <section className="hero" id="hero">
          <div className="zoom-container">
            <div className="zoom-element">
              <h1 className="main-title" style={{wordSpacing:'normal',letterSpacing:'normal',whiteSpace:'normal',textRendering:'optimizeLegibility'}}>Master&nbsp;Your&nbsp;Money&nbsp;System</h1>
              <p className="subtitle">Take control of your financial future with our all-in-one personal finance solution. Experience peace of mind knowing your finances are <span className="word-rotator" data-words='["unbroken", "organized", "optimized", "simplified"]'>{WORDS[currentWord]}</span>.</p>
              <div className="image-zoom reveal-on-scroll">
                <img src="/dashboard-preview.svg" alt="Unbroken Pockets Dashboard Preview" />
              </div>
              <a href="/auth/signin" className="cta-button magnetic-button">Start&nbsp;Your&nbsp;Financial&nbsp;Journey</a>
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section id="features" className="feature-section">
          <h2 className="section-title reveal-on-scroll">Everything You Need</h2>
          <p className="section-text reveal-on-scroll">All the tools to help you master your finances in one beautiful, easy-to-use app.</p>
          <div className="feature-grid">
            <div className="feature-item"> <b>Dashboard</b><br />Your financial overview at a glance. </div>
            <div className="feature-item"> <b>Accounts</b><br />All your accounts, one place. </div>
            <div className="feature-item"> <b>Budget</b><br />Plan, track, and optimize spending. </div>
            <div className="feature-item"> <b>Cash Flow</b><br />Visualize income and expenses. </div>
            <div className="feature-item"> <b>Debt</b><br />Track and pay off debts faster. </div>
            <div className="feature-item"> <b>Goals</b><br />Set and achieve financial goals. </div>
            <div className="feature-item"> <b>Investments</b><br />Monitor your portfolio. </div>
            <div className="feature-item"> <b>Recurring</b><br />Automate bills & subscriptions. </div>
            <div className="feature-item"> <b>Reports</b><br />Detailed insights and analytics. </div>
            <div className="feature-item"> <b>Transactions</b><br />Effortless tracking and categorization. </div>
          </div>
        </section>
        {/* Gallery Section */}
        <section className="gallery-section" id="gallery">
          <div className="zoom-container">
            <div className="zoom-element">
              <h2 className="section-title reveal-on-scroll">Experience&nbsp;Financial&nbsp;Peace</h2>
              <p className="section-text reveal-on-scroll">See how Unbroken Pockets transforms your financial life with these powerful features.</p>
              <div className="gallery-grid">
                <div className="gallery-item"><img src="/gallery1.png" alt="Gallery 1" /><div className="gallery-title">Intuitive Dashboard</div></div>
                <div className="gallery-item"><img src="/gallery2.png" alt="Gallery 2" /><div className="gallery-title">Budgeting Tools</div></div>
                <div className="gallery-item"><img src="/gallery3.png" alt="Gallery 3" /><div className="gallery-title">Spending Insights</div></div>
                <div className="gallery-item"><img src="/gallery4.png" alt="Gallery 4" /><div className="gallery-title">Goal Tracking</div></div>
              </div>
            </div>
          </div>
        </section>
        {/* Finance Preview Section */}
        <div className="finance-preview">
          <div className="preview-header">
            <div className="preview-title">Your Monthly Overview</div>
            <div className="preview-subtitle">See all your accounts and spending at a glance</div>
          </div>
          <div className="preview-content">
            <div className="finance-menu">
              <div className="finance-menu-item">Checking Account: $3,200</div>
              <div className="finance-menu-item">Savings Account: $8,100</div>
              <div className="finance-menu-item">Credit Card: -$1,200</div>
              <div className="finance-menu-item">Investments: $12,000</div>
            </div>
            <div className="finance-chart">
              {/* Placeholder for chart/graph */}
              <div style={{ width: '100%', height: 200, background: '#f0f6ff', borderRadius: 20 }} />
            </div>
          </div>
        </div>
        {/* CTA Section */}
        <section className="cta-section" id="cta">
          <div className="zoom-container">
            <div className="zoom-element">
              <h2 className="section-title">Ready to Master Your Money?</h2>
              <a href="/signup" className="cta-btn">Get Started Now</a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">&copy; {new Date().getFullYear()} Unbroken Pockets. All rights reserved.</footer>
      </div>
    </>
  );
};

export default LandingHtml;
