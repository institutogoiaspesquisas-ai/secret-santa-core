import { useEffect, useRef } from 'react';

interface ConfettiEffectProps {
    isActive: boolean;
    duration?: number;
    onComplete?: () => void;
}

interface Particle {
    x: number;
    y: number;
    size: number;
    color: string;
    speed: number;
    angle: number;
    rotation: number;
    rotationSpeed: number;
}

const COLORS = ['#FFD166', '#2E8BFF', '#FF6B6B', '#4ECDC4', '#A855F7', '#F97316'];

export function ConfettiEffect({ isActive, duration = 2500, onComplete }: ConfettiEffectProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    useEffect(() => {
        if (!isActive || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Create particles
        const particles: Particle[] = [];
        const particleCount = 150;

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 10 + 5,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                speed: Math.random() * 3 + 2,
                angle: Math.random() * Math.PI * 2,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.2,
            });
        }

        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;

            if (elapsed > duration) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                onComplete?.();
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle) => {
                particle.y += particle.speed;
                particle.x += Math.sin(particle.angle) * 2;
                particle.rotation += particle.rotationSpeed;
                particle.angle += 0.01;

                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate(particle.rotation);
                ctx.fillStyle = particle.color;
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size / 3);
                ctx.restore();

                // Reset particle if it goes off screen
                if (particle.y > canvas.height) {
                    particle.y = -particle.size;
                    particle.x = Math.random() * canvas.width;
                }
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isActive, duration, onComplete]);

    if (!isActive) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-50"
            style={{ mixBlendMode: 'screen' }}
        />
    );
}
