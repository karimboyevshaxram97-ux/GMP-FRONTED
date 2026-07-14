import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { GET_PHOTOS } from '../../../apollo/user/query';
import { REACT_APP_API_URL } from '../../config';
import { useLang } from '../../utils/lang';
import { useUiLang } from '../../utils/translations';

const MAX_PER_AGENCY = 2;
const TOTAL_CARDS = 5;
const FETCH_POOL_SIZE = 20;

// Barcha board'lardan (getPhotos allaqachon likeCount bo'yicha kamayish tartibida
// qaytaradi) eng ko'p like yig'gan rasmlar — lekin bitta agentlik barcha 5 ta joyni
// egallab qolmasligi uchun har agentlikdan MAX_PER_AGENCY tagacha olinadi.
const pickDiversePhotos = (photos: any[]): any[] => {
	const perAgency = new Map<string, number>();
	const picked: any[] = [];
	for (const photo of photos) {
		const count = perAgency.get(photo.agency) ?? 0;
		if (count >= MAX_PER_AGENCY) continue;
		picked.push(photo);
		perAgency.set(photo.agency, count + 1);
		if (picked.length >= TOTAL_CARDS) break;
	}
	return picked;
};

// Homepage: butun platformadagi eng ko'p like yig'gan 5 ta rasm — 2 katta + 3 kichik
// karta qatorida. Rasmning o'zini bosilsa lightbox'da kattalashib ochiladi; agentlik
// nishonchasi (logo+nom) bosilsa o'sha agentlik sahifasiga o'tkazadi.
const TopLikedPhotos = () => {
	const tr = useLang();
	const ui = useUiLang();
	const router = useRouter();
	const [visible, setVisible] = useState(false);
	const [lightboxPhoto, setLightboxPhoto] = useState<{ src: string; name: string } | null>(null);
	const gridRef = useRef<HTMLDivElement>(null);

	const { data } = useQuery(GET_PHOTOS, {
		fetchPolicy: 'cache-and-network',
		nextFetchPolicy: 'cache-first',
		variables: { input: { page: 1, limit: FETCH_POOL_SIZE } },
	});

	const photos = pickDiversePhotos(data?.getPhotos?.list ?? []);
	const topRow = photos.slice(0, 2);
	const bottomRow = photos.slice(2, 5);

	useEffect(() => {
		if (!gridRef.current) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) setVisible(true);
			},
			{ threshold: 0.2 },
		);
		observer.observe(gridRef.current);
		return () => observer.disconnect();
	}, [photos.length]);

	// Kamida 3 ta rasm bo'lmasa 2 qatorli layout chiroyli ko'rinmaydi — bo'lim butunlay yashiriladi.
	if (photos.length < 3) return null;

	const renderCard = (photo: any) => {
		const name = tr(photo.agencyName) || ui('auth.agency');
		const src = `${REACT_APP_API_URL}/uploads/${photo.image}`;
		return (
			<div
				key={photo._id}
				className="top-liked-photo-card"
				onClick={() => setLightboxPhoto({ src, name })}
				title={name}
			>
				<img src={src} alt={name} loading="lazy" />
				<div className="top-liked-photo-card__overlay">
					<div
						className="top-liked-photo-card__agency"
						onClick={(e) => { e.stopPropagation(); router.push(`/agency/${photo.agency}`); }}
					>
						{photo.agencyLogo && <img src={`${REACT_APP_API_URL}/uploads/${photo.agencyLogo}`} alt="" />}
						<span>{name}</span>
					</div>
					<span className="top-liked-photo-card__likes">
						<FavoriteIcon /> {photo.likeCount ?? 0}
					</span>
				</div>
			</div>
		);
	};

	return (
		<section className="top-liked-photos">
			<div className="container">
				<div className="top-liked-photos__head">
					<span className="top-liked-photos__tag">{ui('home.topLikedPhotosTag')}</span>
					<h2>{ui('home.topLikedPhotosTitle')}</h2>
					<p>{ui('home.topLikedPhotosDesc')}</p>
				</div>

				<div className={`top-liked-photos__grid${visible ? ' in-view' : ''}`} ref={gridRef}>
					<div className="top-liked-photos__row top-liked-photos__row--top">
						{topRow.map(renderCard)}
					</div>
					{bottomRow.length > 0 && (
						<div className="top-liked-photos__row top-liked-photos__row--bottom">
							{bottomRow.map(renderCard)}
						</div>
					)}
				</div>
			</div>

			{lightboxPhoto && (
				<div className="photo-lightbox" onClick={() => setLightboxPhoto(null)}>
					<button className="photo-lightbox__close" onClick={() => setLightboxPhoto(null)}>
						<CloseIcon />
					</button>
					<img src={lightboxPhoto.src} alt={lightboxPhoto.name} />
				</div>
			)}
		</section>
	);
};

export default TopLikedPhotos;
