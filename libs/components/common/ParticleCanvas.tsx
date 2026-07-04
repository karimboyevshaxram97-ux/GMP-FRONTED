import React, { useEffect, useRef } from 'react';
import { animate, utils } from 'animejs';

interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	r: number;
	opacity: number;
}

const ParticleCanvas: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const resize = () => {
			canvas.width = canvas.offsetWidth;
			canvas.height = canvas.offsetHeight;
		};
		resize();
		window.addEventListener('resize', resize);

		// Create particles
		const particles: Particle[] = Array.from({ length: 38 }, () => ({
			x: Math.random() * canvas.width,
			y: Math.random() * canvas.height,
			vx: (Math.random() - 0.5) * 0.45,
			vy: (Math.random() - 0.5) * 0.45,
			r: Math.random() * 1.8 + 0.6,
			opacity: Math.random() * 0.35 + 0.1,
		}));

		// Animate each particle's opacity + size with anime.js
		particles.forEach((p) => {
			const proxy = { opacity: p.opacity, r: p.r };
			animate(proxy, {
				opacity: utils.random(0.08, 0.55),
				r: utils.random(0.5, 2.4),
				duration: utils.random(2500, 5500),
				delay: utils.random(0, 2000),
				loop: true,
				direction: 'alternate',
				ease: 'inOutSine',
				onUpdate: () => {
					p.opacity = proxy.opacity as number;
					p.r = proxy.r as number;
				},
			});
		});

		// Draw loop
		let animId: number;

		const draw = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Connections
			for (let i = 0; i < particles.length; i++) {
				for (let j = i + 1; j < particles.length; j++) {
					const dx = particles[i].x - particles[j].x;
					const dy = particles[i].y - particles[j].y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < 120) {
						ctx.beginPath();
						ctx.moveTo(particles[i].x, particles[i].y);
						ctx.lineTo(particles[j].x, particles[j].y);
						ctx.strokeStyle = `rgba(100, 150, 255, ${(1 - dist / 120) * 0.1})`;
						ctx.lineWidth = 0.7;
						ctx.stroke();
					}
				}
			}

			// Dots
			particles.forEach((p) => {
				p.x += p.vx;
				p.y += p.vy;
				if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
				if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

				ctx.beginPath();
				ctx.arc(p.x, p.y, Math.max(0.3, p.r), 0, Math.PI * 2);
				ctx.fillStyle = `rgba(100, 160, 255, ${p.opacity})`;
				ctx.fill();
			});

			animId = requestAnimationFrame(draw);
		};

		draw();

		return () => {
			cancelAnimationFrame(animId);
			window.removeEventListener('resize', resize);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
		/>
	);
};

export default ParticleCanvas;
