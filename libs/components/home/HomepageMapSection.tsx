import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';
import ApartmentIcon from '@mui/icons-material/Apartment';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import { GET_AGENCIES_FOR_MAP } from '../../../apollo/user/query';
import { Agency } from '../../types/agency/agency';
import { REACT_APP_API_URL } from '../../config';
import { useLang } from '../../utils/lang';
import { useUiLang } from '../../utils/translations';

const HomepageMapSection: React.FC = () => {
	const router = useRouter();
	const tr = useLang();
	const ui = useUiLang();
	const viewProfileLabel = ui('View Profile');

	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<any>(null);

	const { data, loading } = useQuery<{ getAgenciesForMap: Agency[] }>(
		GET_AGENCIES_FOR_MAP,
		{ variables: { filter: {} }, fetchPolicy: 'cache-and-network' },
	);

	const agencies: Agency[] = data?.getAgenciesForMap ?? [];
	const featuredCards = agencies.slice(0, 3);
	const uniqueCountries = Array.from(new Set(agencies.map((a) => a.country).filter(Boolean))).length;
	const uniqueCities = Array.from(new Set(agencies.map((a) => a.city).filter(Boolean))).length;

	// ── Init map ────────────────────────────────────────────────────────────────
	useEffect(() => {
		if (!mapContainerRef.current || mapInstanceRef.current) return;

		const L = require('leaflet');
		require('leaflet/dist/leaflet.css');

		delete L.Icon.Default.prototype._getIconUrl;
		L.Icon.Default.mergeOptions({
			iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
			iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
		});

		const map = L.map(mapContainerRef.current, {
			center: [41.2995, 69.2401],
			zoom: 4,
			scrollWheelZoom: false,
			zoomControl: true,
			attributionControl: true,
		});

		L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
			attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
			subdomains: 'abcd',
			maxZoom: 19,
		}).addTo(map);

		mapInstanceRef.current = map;

		// Flex layout settles after paint — recalculate tile grid
		const t = setTimeout(() => map.invalidateSize(), 200);

		return () => {
			clearTimeout(t);
			map.remove();
			mapInstanceRef.current = null;
		};
	}, []);

	// ── Add markers ─────────────────────────────────────────────────────────────
	useEffect(() => {
		const map = mapInstanceRef.current;
		if (!map || agencies.length === 0) return;

		const L = require('leaflet');

		const redIcon = L.icon({
			iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41],
		});

		const markersAdded: any[] = [];

		agencies.forEach((agency) => {
			if (!agency.latitude || !agency.longitude) return;
			const name = tr(agency.name);
			const popupHtml = `
				<div class="map-info-window" style="min-width:200px;">
					<div class="iw-header">
						${agency.logo
					? `<img src="${REACT_APP_API_URL}/uploads/${agency.logo}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;" />`
					: `<div style="width:44px;height:44px;border-radius:8px;background:linear-gradient(135deg,#0d9488,#1649ff);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;color:#fff;">${name.charAt(0).toUpperCase()}</div>`
				}
						<div class="iw-name">${name}</div>
					</div>
					${agency.city ? `<div class="iw-address">${[agency.city, agency.country].filter(Boolean).join(', ')}</div>` : ''}
					<a href="/agency/${agency._id}" class="iw-btn" style="display:block;width:100%;padding:7px 0;background:#0d9488;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;text-align:center;text-decoration:none;">${viewProfileLabel} →</a>
				</div>`;
			const marker = L.marker([agency.latitude, agency.longitude], { icon: redIcon })
				.bindPopup(popupHtml, { minWidth: 210 })
				.addTo(map);
			markersAdded.push(marker);
		});

		const points = agencies.filter((a) => a.latitude && a.longitude);
		if (points.length > 0) {
			const bounds = L.latLngBounds(points.map((a: Agency) => [a.latitude!, a.longitude!]));
			map.fitBounds(bounds, { padding: [30, 30], maxZoom: 10 });
		}

		return () => { markersAdded.forEach((m) => m.remove()); };
	}, [agencies, viewProfileLabel]);

	return (
		<section className="home-map-section">
			<div className="home-map-blob home-map-blob--1" />
			<div className="home-map-blob home-map-blob--2" />

			<div className="container">

				{/* ── Header ── */}
				<div className="home-map-header">
					<div className="home-map-header__left">
						<span className="home-map-eyebrow">
							<LocationOnIcon style={{ fontSize: 13 }} />
							{ui('Agency locations worldwide')}
						</span>
						<h2>{ui('Find agencies')} <span>{ui('near you')}</span></h2>
						<p>{ui('Browse our global network of verified migration agencies on the interactive map.')}</p>
					</div>

					{/* Stats */}
					<div className="home-map-stats">
						<div className="home-map-stat">
							<ApartmentIcon />
							<strong>{loading ? '—' : `${agencies.length}+`}</strong>
							<span>{ui('Agencies')}</span>
						</div>
						<div className="home-map-stat-div" />
						<div className="home-map-stat">
							<PublicIcon />
							<strong>{loading ? '—' : `${uniqueCountries}+`}</strong>
							<span>{ui('Countries')}</span>
						</div>
						<div className="home-map-stat-div" />
						<div className="home-map-stat">
							<LocationCityIcon />
							<strong>{loading ? '—' : `${uniqueCities}+`}</strong>
							<span>{ui('Cities')}</span>
						</div>
					</div>
				</div>

				{/* ── Body: left cards + right map ── */}
				<div className="home-map-body">

					{/* LEFT — 3 agency cards */}
					<div className="home-map-cards">
						{loading ? (
							[0, 1, 2].map((i) => (
								<div key={i} className="hmc-card hmc-card--skeleton">
									<div className="hmc-sk-avatar" />
									<div className="hmc-sk-lines">
										<div style={{ width: '60%' }} />
										<div style={{ width: '80%' }} />
										<div style={{ width: '45%' }} />
									</div>
								</div>
							))
						) : featuredCards.length > 0 ? (
							featuredCards.map((agency, idx) => {
								const name = tr(agency.name);
								const location = [agency.city, agency.country].filter(Boolean).join(', ');
								const initial = name.charAt(0).toUpperCase();
								const GRADIENTS = [
									'linear-gradient(135deg,#0d9488,#1649ff)',
									'linear-gradient(135deg,#7c3aed,#1649ff)',
									'linear-gradient(135deg,#ea580c,#f59e0b)',
								];
								return (
									<div
										key={agency._id}
										className="hmc-card"
										onClick={() => router.push(`/agency/${agency._id}`)}
									>
										{/* Rank badge */}
										<span className="hmc-rank">#{idx + 1}</span>

										{/* Logo */}
										{agency.logo ? (
											<img
												className="hmc-avatar"
												src={`${REACT_APP_API_URL}/uploads/${agency.logo}`}
												alt={name}
											/>
										) : (
											<div className="hmc-avatar hmc-avatar--placeholder" style={{ background: GRADIENTS[idx] }}>
												{initial}
											</div>
										)}

										{/* Info */}
										<div className="hmc-info">
											<div className="hmc-name">{name}</div>

											{location && (
												<div className="hmc-location">
													<LocationOnIcon style={{ fontSize: 13 }} />
													{location}
												</div>
											)}

											<div className="hmc-meta">
												{(agency.averageRating ?? 0) > 0 && (
													<span className="hmc-rating">
														<StarIcon style={{ fontSize: 13 }} />
														{(agency.averageRating ?? 0).toFixed(1)}
													</span>
												)}
												{agency.totalServices ? (
													<span className="hmc-services">{agency.totalServices} {ui('services')}</span>
												) : null}
												{agency.verificationStatus === 'VERIFIED' && (
													<span className="hmc-verified">
														<VerifiedIcon style={{ fontSize: 13 }} />
														{ui('Verified')}
													</span>
												)}
											</div>
										</div>

										{/* Arrow */}
										<div className="hmc-arrow">
											<ArrowForwardIcon style={{ fontSize: 16 }} />
										</div>
									</div>
								);
							})
						) : (
							/* Empty placeholder cards when no lat/lng data yet */
							[
								{ title: 'Add agency data', sub: 'Set lat/lng in agency profiles to see them here' },
								{ title: 'Verified agencies', sub: 'Top-rated agencies appear on the map' },
								{ title: 'Global network', sub: 'Agencies across multiple countries' },
							].map((item, i) => (
								<div key={i} className="hmc-card hmc-card--placeholder">
									<div className="hmc-avatar hmc-avatar--placeholder" style={{ background: ['linear-gradient(135deg,#0d9488,#1649ff)', 'linear-gradient(135deg,#7c3aed,#1649ff)', 'linear-gradient(135deg,#ea580c,#f59e0b)'][i] }}>
										{['🏢', '⭐', '🌍'][i]}
									</div>
									<div className="hmc-info">
										<div className="hmc-name">{ui(item.title)}</div>
										<div className="hmc-location" style={{ marginTop: 4 }}>{ui(item.sub)}</div>
									</div>
								</div>
							))
						)}

						{/* View all */}
						<button className="home-map-viewall" onClick={() => router.push('/agency/map')}>
							{ui('Explore full map')}
							<ArrowForwardIcon style={{ fontSize: 17 }} />
						</button>
					</div>

					{/* RIGHT — Map */}
					<div className="home-map-container">
						{loading && (
							<div className="home-map-loading">
								<span className="hml-pulse" />
								<span>{ui('Loading map...')}</span>
							</div>
						)}
						<div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
						<div className="home-map-overlay-cta" onClick={() => router.push('/agency/map')}>
							<LocationOnIcon />
							<span>{ui('Open interactive map')}</span>
							<ArrowForwardIcon style={{ fontSize: 15 }} />
						</div>
					</div>
				</div>

			</div>
		</section>
	);
};

export default HomepageMapSection;
