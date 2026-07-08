import React, { useEffect, useState } from 'react';
import MusicNoteOutlinedIcon from '@mui/icons-material/MusicNoteOutlined';

// Audio React tashqarisida — sahifa almashganda ham uzilmaydi
let sharedAudio: HTMLAudioElement | null = null;

const getAudio = (): HTMLAudioElement | null => {
	if (typeof window === 'undefined') return null;
	if (!sharedAudio) {
		sharedAudio = new Audio('/audio/ambient.mp3');
		sharedAudio.loop = true;
		sharedAudio.volume = 0.3;
	}
	return sharedAudio;
};

const MusicToggle = () => {
	const [playing, setPlaying] = useState(false);

	// Komponent qayta yaratilganda (sahifa almashganda) holatni audio'dan o'qiymiz
	useEffect(() => {
		const audio = sharedAudio;
		setPlaying(!!audio && !audio.paused);
		if (!audio) return;
		const onPlay = () => setPlaying(true);
		const onPause = () => setPlaying(false);
		audio.addEventListener('play', onPlay);
		audio.addEventListener('pause', onPause);
		return () => {
			audio.removeEventListener('play', onPlay);
			audio.removeEventListener('pause', onPause);
		};
	}, []);

	const setMediaSession = () => {
		if (!('mediaSession' in navigator)) return;
		navigator.mediaSession.metadata = new MediaMetadata({
			title: 'GMP — Piano',
			artist: 'Heartbreaking — Kevin MacLeod',
			artwork: [{ src: '/img/logo/favicon.svg', sizes: '96x96', type: 'image/svg+xml' }],
		});
		navigator.mediaSession.setActionHandler('play', () => { getAudio()?.play(); });
		navigator.mediaSession.setActionHandler('pause', () => { getAudio()?.pause(); });
	};

	const toggle = () => {
		const audio = getAudio();
		if (!audio) return;
		if (!audio.paused) {
			audio.pause();
			setPlaying(false);
		} else {
			audio.play().then(() => { setPlaying(true); setMediaSession(); }).catch(() => undefined);
		}
	};

	return (
		<button
			type="button"
			className={`music-toggle${playing ? ' playing' : ''}`}
			onClick={toggle}
			aria-label={playing ? 'Pause music' : 'Play music'}
		>
			{playing ? (
				<span className="music-eq" aria-hidden="true">
					<span /><span /><span />
				</span>
			) : (
				<MusicNoteOutlinedIcon />
			)}
		</button>
	);
};

export default MusicToggle;
