// Particles.js - A lightweight particle system for web background effects
// Designed for Unbroken Pockets application

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match window
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Particle class
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            // Position
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            
            // Size
            this.size = Math.random() * 4 + 1;
            
            // Velocity
            this.vx = Math.random() * 0.3 - 0.15;
            this.vy = Math.random() * 0.3 - 0.15;
            
            // Color
            this.color = this.getRandomColor();
            
            // Opacity
            this.alpha = Math.random() * 0.6 + 0.2;
            
            // Life
            this.life = Math.random() * 150 + 150;
            this.maxLife = this.life;
        }
        
        getRandomColor() {
            const colors = [
                'rgba(74, 111, 161, ',  // Primary blue
                'rgba(126, 180, 226, ', // Light blue
                'rgba(152, 193, 230, ', // Sky blue
                'rgba(95, 129, 175, ',  // Medium blue
                'rgba(74, 142, 202, '   // Accent blue
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ')';
            ctx.fill();
        }
        
        update() {
            // Update position
            this.x += this.vx;
            this.y += this.vy;
            
            // Shrink as life decreases
            this.size = (this.life / this.maxLife) * (Math.random() * 4 + 1);
            
            // Decrease life
            this.life--;
            
            // Reset if life is over or out of bounds
            if (this.life <= 0 || 
                this.x < 0 || 
                this.x > canvas.width || 
                this.y < 0 || 
                this.y > canvas.height) {
                this.reset();
            }
        }
    }
    
    // Create particles
    const particles = [];
    const particleCount = Math.min(window.innerWidth / 8, 150); // More responsive particle count
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    function animate() {
        // Clear canvas with semi-transparent background to create trail effect
        ctx.fillStyle = 'rgba(240, 246, 255, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // Connect particles that are close to each other
        connectParticles();
        
        // Request next frame
        requestAnimationFrame(animate);
    }
    
    // Connect particles with lines if they're close enough
    function connectParticles() {
        const maxDistance = 120;
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    // Opacity based on distance
                    const opacity = 1 - (distance / maxDistance);
                    
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(126, 180, 226, ${opacity * 0.3})`;
                    ctx.lineWidth = 0.7;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    // Start animation
    animate();
    
    // Add interactivity - particles follow mouse slightly
    let mouseX = null;
    let mouseY = null;
    
    canvas.addEventListener('mousemove', (e) => {
        mouseX = e.x;
        mouseY = e.y;
        
        // More noticeable influence on nearby particles
        particles.forEach(particle => {
            const dx = mouseX - particle.x;
            const dy = mouseY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                particle.vx += dx * 0.0002;
                particle.vy += dy * 0.0002;
            }
        });
    });
    
    // Reset mouse position when mouse leaves canvas
    canvas.addEventListener('mouseleave', () => {
        mouseX = null;
        mouseY = null;
    });
}); 