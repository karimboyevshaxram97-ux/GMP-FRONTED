import React, { useEffect, useRef, useState } from 'react';
import { useUiLang } from '../../utils/translations';

// O'z reklama videongizni qo'yish uchun shu ID ni almashtiring
// (https://youtu.be/XXXXXXXXXXX dagi XXXXXXXXXXX qismi)
const YOUTUBE_VIDEO_ID = 'V72pPDz43KI'; // touropia — "50 Most Beautiful Cities in the World" 4K

const VideoSection = () => {
	const ui = useUiLang();
	const sectionRef = useRef<HTMLElement>(null);
	const [visible, setVisible] = useState(false);
	const [playing, setPlaying] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setVisible(true);
				}
			},
			{ threshold: 0.2 },
		);
		if (sectionRef.current) observer.observe(sectionRef.current);
		return () => observer.disconnect();
	}, []);

	// Skroll qilib yetib kelinganda tugma bosmasdan, ovozsiz va aylanma
	// (loop) holatda avtomatik ishga tushadi — brauzerlar faqat "muted"
	// autoplay'ga ruxsat beradi.
	useEffect(() => {
		if (visible) setPlaying(true);
	}, [visible]);

	return (
		<section className="home-marketing" ref={sectionRef}>
			{/* Background decorations */}
			<div className="hm-orb hm-orb-1" aria-hidden="true" />
			<div className="hm-orb hm-orb-2" aria-hidden="true" />
			<div className="hm-grid-lines" aria-hidden="true" />

			<div className="container">
				{/* Video showcase — full width, the section's main focus (lite YouTube embed — iframe loads only on click) */}
				<div className={`hm-body${visible ? ' visible' : ''}`}>
					<div className="hm-preview">
						<div className="hm-video">
							{playing ? (
								<iframe
									src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&rel=0&modestbranding=1`}
									title={ui('home.watchVideo')}
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
									allowFullScreen
								/>
							) : (
								<button
									type="button"
									className="hm-video__facade"
									onClick={() => setPlaying(true)}
									aria-label={ui('home.watchVideo')}
								>
									<img
									src={`https://i.ytimg.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`}
									onError={(e) => { e.currentTarget.src = '/img/travel-bg.jpg'; }}
									alt=""
									aria-hidden="true"
								/>
									<span className="hm-video__scrim" />
									<span className="hm-video__play">
										<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
											<path d="M8 5v14l11-7z" />
										</svg>
									</span>
									<span className="hm-video__label">{ui('home.watchVideo')}</span>
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default VideoSection;
