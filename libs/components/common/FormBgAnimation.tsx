import React, { useEffect, useRef } from 'react';

const BLOBS = [
	{ color: '#1649ff', size: 280, top: '-80px',  left: '-60px',  opacity: 0.07 },
	{ color: '#7c3aed', size: 220, top: '60%',    left: '70%',    opacity: 0.06 },
	{ color: '#0ea5e9', size: 180, top: '30%',    left: '-40px',  opacity: 0.05 },
	{ color: '#6366f1', size: 200, top: '-40px',  left: '60%',    opacity: 0.06 },
	{ color: '#a855f7', size: 160, top: '75%',    left: '10%',    opacity: 0.05 },
];

const FormBgAnimation: React.FC = () => {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		import('animejs').then(({ animate, utils }) => {
			const blobs = containerRef.current?.querySelectorAll('.frm-blob');
			if (!blobs) return;

			blobs.forEach((blob) => {
				const loop = () => {
					animate(blob, {
						translateX: utils.random(-40, 40),
						translateY: utils.random(-40, 40),
						scale:      utils.random(0.85, 1.18),
						opacity:    utils.random(0.04, 0.1),
						duration:   utils.random(5000, 9000),
						ease:       'inOutQuad',
						onComplete: loop,
					});
				};
				loop();
			});
		});
	}, []);

	return (
		<div
			ref={containerRef}
			style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}
		>
			{BLOBS.map((b, i) => (
				<div
					key={i}
					className="frm-blob"
					style={{
						position:     'absolute',
						width:        b.size,
						height:       b.size,
						top:          b.top,
						left:         b.left,
						borderRadius: '50%',
						background:   b.color,
						filter:       'blur(60px)',
						opacity:      b.opacity,
					}}
				/>
			))}
		</div>
	);
};

export default FormBgAnimation;
