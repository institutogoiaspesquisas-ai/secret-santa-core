import { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import './Mascot.css';

interface MascotProps {
    size?: 'sm' | 'md' | 'lg';
}

const Mascot = ({ size = 'lg' }: MascotProps) => {
    const mascotBodyRef = useRef<HTMLDivElement>(null);
    const mascotHaloRef = useRef<HTMLDivElement>(null);
    const eyeLeftRef = useRef<HTMLDivElement>(null);
    const eyeRightRef = useRef<HTMLDivElement>(null);

    const isUserInteractingRef = useRef(false);
    const idleTimeoutRef = useRef<NodeJS.Timeout>();
    const blinkTimeoutRef = useRef<NodeJS.Timeout>();

    const [isJumping, setIsJumping] = useState(false);

    const moveEyes = useCallback((x: number, y: number) => {
        if (eyeLeftRef.current) eyeLeftRef.current.style.transform = `translate(${x}px, ${y}px)`;
        if (eyeRightRef.current) eyeRightRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }, []);

    const startIdleLooking = useCallback(() => {
        if (isUserInteractingRef.current) return;

        const randomLook = () => {
            if (isUserInteractingRef.current) return;

            const randomX = (Math.random() - 0.5) * 24;
            const randomY = (Math.random() - 0.5) * 16;

            moveEyes(randomX, randomY);

            setTimeout(() => {
                if (!isUserInteractingRef.current) {
                    moveEyes(0, 0);
                }
            }, 1500 + Math.random() * 1000);

            idleTimeoutRef.current = setTimeout(randomLook, 4000 + Math.random() * 4000);
        };

        idleTimeoutRef.current = setTimeout(randomLook, 2000);
    }, [moveEyes]);

    useEffect(() => {
        const blink = () => {
            if (eyeLeftRef.current) {
                eyeLeftRef.current.style.animation = 'blink 0.2s ease-in-out';
            }
            if (eyeRightRef.current) {
                eyeRightRef.current.style.animation = 'blink 0.2s ease-in-out';
            }

            setTimeout(() => {
                if (eyeLeftRef.current) eyeLeftRef.current.style.animation = '';
                if (eyeRightRef.current) eyeRightRef.current.style.animation = '';
            }, 200);
        };

        const scheduleBlink = () => {
            const delay = 3000 + Math.random() * 3000;
            blinkTimeoutRef.current = setTimeout(() => {
                blink();
                scheduleBlink();
            }, delay);
        };

        scheduleBlink();

        return () => {
            if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        startIdleLooking();

        return () => {
            if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
        };
    }, [startIdleLooking]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            isUserInteractingRef.current = true;
            if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);

            if (!mascotBodyRef.current) return;

            const rect = mascotBodyRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;

            const maxX = 12;
            const maxY = 8;

            const moveX = Math.max(-maxX, Math.min(maxX, deltaX / 30));
            const moveY = Math.max(-maxY, Math.min(maxY, deltaY / 30));

            moveEyes(moveX, moveY);

            idleTimeoutRef.current = setTimeout(() => {
                isUserInteractingRef.current = false;
                moveEyes(0, 0);
                startIdleLooking();
            }, 2000);
        };

        const handleMouseLeave = () => {
            // Keep eyes centered if mouse leaves
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [moveEyes, startIdleLooking]);


    const triggerJump = () => {
        if (isJumping) return;

        setIsJumping(true);

        setTimeout(() => {
            launchConfetti();
        }, 350);

        setTimeout(() => {
            setIsJumping(false);
        }, 900);
    };

    const launchConfetti = () => {
        if (!mascotBodyRef.current) return;

        const rect = mascotBodyRef.current.getBoundingClientRect();

        const originX = (rect.left + rect.width / 2) / window.innerWidth;
        const originY = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({
            particleCount: 80,
            spread: 360,
            origin: { x: originX, y: originY },
            colors: ['#00D4FF', '#4D9FFF', '#9966FF', '#FF66CC', '#FFFF00', '#00FF88'],
            ticks: 200,
            gravity: 0.8,
            scalar: 1.2,
            shapes: ['square', 'circle'],
            disableForReducedMotion: true
        });
    };

    const sizeClass = {
        sm: 'mascot-size-sm',
        md: 'mascot-size-md',
        lg: 'mascot-size-lg',
    }[size];

    return (
        <div className={`mascot-wrapper ${sizeClass}`}>
            <div
                className="mascot-container"
                onClick={triggerJump}
            >
                {/* Halo */}
                <div
                    ref={mascotHaloRef}
                    className={`mascot-halo ${isJumping ? 'jumping-halo' : ''}`}
                ></div>

                {/* Body */}
                <div
                    ref={mascotBodyRef}
                    className={`mascot-body ${isJumping ? 'jumping' : ''}`}
                >
                    {/* Left Eye */}
                    <div ref={eyeLeftRef} className="mascot-eye mascot-eye--left"></div>
                    {/* Right Eye */}
                    <div ref={eyeRightRef} className="mascot-eye mascot-eye--right"></div>
                </div>
            </div>
        </div>
    );
};

export default Mascot;
