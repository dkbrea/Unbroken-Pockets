// Advanced micro-interactions for Unbroken Pockets landing page
document.addEventListener('DOMContentLoaded', () => {
    // Text scramble effect
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.update = this.update.bind(this);
        }
        
        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }
            
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
        
        update() {
            let output = '';
            let complete = 0;
            
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.randomChar();
                        this.queue[i].char = char;
                    }
                    output += `<span class="dud">${char}</span>`;
                } else {
                    output += from;
                }
            }
            
            this.el.innerHTML = output;
            
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }
        
        randomChar() {
            return this.chars[Math.floor(Math.random() * this.chars.length)];
        }
    }

    // Tilt effect on hover
    const tiltEffectSettings = {
        max: 15, // max tilt rotation
        perspective: 1000, // transform perspective
        scale: 1.05, // 2D scale multiplier
        speed: 500, // speed
        easing: 'cubic-bezier(.03,.98,.52,.99)' // easing
    };

    const addTiltEffect = (el) => {
        el.addEventListener('mouseenter', () => {
            el.style.transition = `transform ${tiltEffectSettings.speed}ms ${tiltEffectSettings.easing}`;
            el.style.transform = `perspective(${tiltEffectSettings.perspective}px) scale(${tiltEffectSettings.scale})`;
        });
        
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xRotation = (tiltEffectSettings.max * (y - rect.height / 2)) / (rect.height / 2) * -1;
            const yRotation = (tiltEffectSettings.max * (x - rect.width / 2)) / (rect.width / 2);
            
            el.style.transition = '';
            el.style.transform = `
                perspective(${tiltEffectSettings.perspective}px) 
                scale(${tiltEffectSettings.scale}) 
                rotateX(${xRotation}deg) 
                rotateY(${yRotation}deg)
            `;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transition = `transform ${tiltEffectSettings.speed}ms ${tiltEffectSettings.easing}`;
            el.style.transform = `
                perspective(${tiltEffectSettings.perspective}px) 
                scale(1) 
                rotateX(0) 
                rotateY(0)
            `;
        });
    };

    // Magnetic button effect
    const magneticButtons = document.querySelectorAll('.cta-button');
    
    magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', function(e) {
            const x = e.offsetX;
            const y = e.offsetY;
            const btnWidth = this.clientWidth;
            const btnHeight = this.clientHeight;
            
            const centerX = btnWidth / 2;
            const centerY = btnHeight / 2;
            
            const moveX = (x - centerX) * 0.3;
            const moveY = (y - centerY) * 0.3;
            
            this.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translate(0px, 0px)';
        });
    });

    // Apply text scramble to main title with phrases
    const titleElement = document.querySelector('.main-title');
    
    if (titleElement) {
        const phrases = [
            'Master Your Money System',
            'Control Your Financial Future',
            'Unbreak Your Finances',
            'Achieve Financial Freedom'
        ];
        
        const scrambler = new TextScramble(titleElement);
        let counter = 0;
        
        const next = () => {
            scrambler.setText(phrases[counter]).then(() => {
                setTimeout(next, 3000);
            });
            counter = (counter + 1) % phrases.length;
        };
        
        next();
    }

    // Apply tilt effect to feature cards
    document.querySelectorAll('.feature-item').forEach(addTiltEffect);
    document.querySelectorAll('.gallery-item').forEach(addTiltEffect);

    // Smooth reveal for elements as they come into view
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    const revealOnScroll = () => {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();

    // Dynamic gradient background that follows cursor
    const dynamicGradient = document.querySelector('.dynamic-gradient');
    
    if (dynamicGradient) {
        document.addEventListener('mousemove', (e) => {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            const mouseXpercentage = Math.round((e.pageX / windowWidth) * 100);
            const mouseYpercentage = Math.round((e.pageY / windowHeight) * 100);
            
            dynamicGradient.style.background = `radial-gradient(at ${mouseXpercentage}% ${mouseYpercentage}%, rgba(74, 111, 161, 0.3), rgba(126, 180, 226, 0.1))`;
        });
    }

    // Word rotating animation
    const wordContainers = document.querySelectorAll('.word-rotator');
    
    wordContainers.forEach(container => {
        const words = JSON.parse(container.getAttribute('data-words'));
        let currentWord = 0;
        
        setInterval(() => {
            container.style.opacity = 0;
            
            setTimeout(() => {
                container.textContent = words[currentWord];
                container.style.opacity = 1;
                currentWord = (currentWord + 1) % words.length;
            }, 500);
        }, 3000);
    });

    // Mobile menu toggle
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenuButton.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link, .auth-buttons a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuButton.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }
    
    // Hover effect for authentication buttons
    const authButtons = document.querySelectorAll('.sign-in-button, .sign-up-button');
    
    authButtons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            if (button.classList.contains('sign-up-button')) {
                gsap.to(button, {
                    y: -2,
                    boxShadow: '0 6px 15px rgba(74, 111, 161, 0.3)',
                    duration: 0.3
                });
            } else {
                gsap.to(button, {
                    backgroundColor: 'rgba(74, 111, 161, 0.1)',
                    duration: 0.3
                });
            }
        });
        
        button.addEventListener('mouseleave', () => {
            if (button.classList.contains('sign-up-button')) {
                gsap.to(button, {
                    y: 0,
                    boxShadow: '0 4px 10px rgba(74, 111, 161, 0.2)',
                    duration: 0.3
                });
            } else {
                gsap.to(button, {
                    backgroundColor: 'transparent',
                    duration: 0.3
                });
            }
        });
        
        // Prevent the default hover behavior when using GSAP animations
        button.addEventListener('click', (e) => {
            // Don't prevent default - let the link navigate
            // But add a small delay for the animation to complete
            if (button.classList.contains('sign-up-button')) {
                e.preventDefault();
                gsap.to(button, {
                    scale: 0.95,
                    duration: 0.1,
                    onComplete: () => {
                        window.location.href = button.getAttribute('href');
                    }
                });
            }
        });
    });
}); 