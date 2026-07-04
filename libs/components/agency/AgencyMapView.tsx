import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import 'leaflet/dist/leaflet.css';
import { GET_AGENCIES_FOR_MAP } from '../../../apollo/user/query';
import { Agency } from '../../types/agency/agency';
import { REACT_APP_API_URL } from '../../config';
import { useLang } from '../../utils/lang';
import { useUiLang } from '../../utils/translations';

function uniqueCountries(agencies: Agency[]): string[] {
	const set = new Set<string>();
	agencies.forEach((a) => { if (a.country) set.add(a.country); });
	return Array.from(set).sort();
}

const AgencyMapView: React.FC = () => {
	const tr = useLang();
	const ui = useUiLang();

	const [searchText, setSearchText] = useState('');
	const [countryFilter, setCountryFilter] = useState('');
	const [cityFilter, setCityFilter] = useState('');
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const sidebarCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<any>(null);
	const markersRef = useRef<Record<string, any>>({});

	const queryFilter = useMemo(() => ({
		text: searchText.trim() || undefined,
		country: countryFilter || undefined,
		city: cityFilter.trim() || undefined,
	}), [searchText, countryFilter, cityFilter]);

	const { data, loading } = useQuery<{ getAgenciesForMap: Agency[] }>(
		GET_AGENCIES_FOR_MAP,
		{ variables: { filter: queryFilter }, fetchPolicy: 'cache-and-network' },
	);

	const agencies: Agency[] = data?.getAgenciesForMap ?? [];
	const countries = useMemo(() => uniqueCountries(agencies), [agencies]);

	// ── Initialize Leaflet map ─────────────────────────────────────────────────
	useEffect(() => {
		const container = mapContainerRef.current;
		if (!container) return;
		// Guard against React 18 Strict Mode double-invoke and re-init
		if ((container as any)._leaflet_id) return;
		if (mapInstanceRef.current) return;

		const L = require('leaflet');

		// Fix default icon paths
		delete (L.Icon.Default.prototype as any)._getIconUrl;
		L.Icon.Default.mergeOptions({
			iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
			iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
		});

		const map = L.map(container, {
			center: [41.2995, 69.2401],
			zoom: 5,
			zoomControl: true,
		});

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			maxZoom: 19,
		}).addTo(map);

		mapInstanceRef.current = map;

		// Force size recalculation at multiple points
		const t1 = setTimeout(() => map.invalidateSize(), 100);
		const t2 = setTimeout(() => map.invalidateSize(), 500);

		return () => {
			clearTimeout(t1);
			clearTimeout(t2);
			map.remove();
			mapInstanceRef.current = null;
			markersRef.current = {};
		};
	}, []);

	// ── Update markers when agencies change ────────────────────────────────────
	useEffect(() => {
		const map = mapInstanceRef.current;
		if (!map) return;

		const L = require('leaflet');

		const redIcon = L.icon({
			iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41],
		});

		const blueIcon = L.icon({
			iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
			iconSize: [30, 46],
			iconAnchor: [15, 46],
			popupAnchor: [1, -38],
			shadowSize: [41, 41],
		});

		// Remove old markers
		Object.values(markersRef.current).forEach((ref: any) => {
			const marker = ref?.marker ?? ref;
			if (typeof marker?.remove === 'function') marker.remove();
		});
		markersRef.current = {};

		agencies.forEach((agency) => {
			if (!agency.latitude || !agency.longitude) return;

			const name = tr(agency.name);
			const addressLine = [agency.address, agency.city, agency.country].filter(Boolean).join(', ');
			const logoHtml = agency.logo
				? `<img src="${REACT_APP_API_URL}/uploads/${agency.logo}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;border:1px solid #e8eaf0;" />`
				: `<div style="width:44px;height:44px;border-radius:8px;background:linear-gradient(135deg,#0d9488,#1649ff);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;color:#fff;flex-shrink:0;">${name.charAt(0).toUpperCase()}</div>`;

			const popupHtml = `
				<div class="map-info-window" style="min-width:210px;">
					<div class="iw-header">
						${logoHtml}
						<div class="iw-name">${name}</div>
					</div>
					${addressLine ? `<div class="iw-address">${addressLine}</div>` : ''}
					${(agency.averageRating ?? 0) > 0 ? `<div class="iw-rating">★ ${(agency.averageRating ?? 0).toFixed(1)} <span>(${agency.totalReviews ?? 0} ${ui('reviews')})</span></div>` : ''}
					<a href="/agency/${agency._id}" class="iw-btn" style="display:block;width:100%;padding:7px 0;background:#0d9488;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;text-align:center;text-decoration:none;">${ui('View Profile')} →</a>
				</div>
			`;

			const marker = L.marker([agency.latitude, agency.longitude], { icon: redIcon })
				.bindPopup(popupHtml, { minWidth: 220, maxWidth: 280 })
				.addTo(map);

			marker.on('click', () => {
				setSelectedId(agency._id);
				sidebarCardRefs.current[agency._id]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			});

			markersRef.current[agency._id] = { marker, redIcon, blueIcon };
		});

		// Fit bounds to all markers
		const points = agencies.filter((a) => a.latitude && a.longitude);
		if (points.length > 0) {
			const bounds = L.latLngBounds(points.map((a) => [a.latitude!, a.longitude!]));
			map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
		}
	}, [agencies, tr, ui]);

	// ── Update icon when selectedId changes ───────────────────────────────────
	useEffect(() => {
		Object.entries(markersRef.current).forEach(([id, ref]: [string, any]) => {
			if (typeof ref?.marker?.setIcon === 'function') {
				ref.marker.setIcon(id === selectedId ? ref.blueIcon : ref.redIcon);
			}
		});
	}, [selectedId]);

	const handleCardClick = useCallback((agency: Agency) => {
		setSelectedId(agency._id);
		const map = mapInstanceRef.current;
		const ref = markersRef.current[agency._id];
		if (map && agency.latitude && agency.longitude) {
			map.flyTo([agency.latitude, agency.longitude], 14, { duration: 0.8 });
			setTimeout(() => ref?.marker?.openPopup(), 900);
		}
	}, []);

	const handleReset = () => {
		setSearchText('');
		setCountryFilter('');
		setCityFilter('');
		setSelectedId(null);
	};

	// ── Sidebar card ──────────────────────────────────────────────────────────
	const renderCard = (agency: Agency) => {
		const name = tr(agency.name);
		const initial = name.charAt(0).toUpperCase();
		const addressLine = [agency.address, agency.city, agency.country].filter(Boolean).join(', ');
		const isActive = selectedId === agency._id;

		return (
			<div
				key={agency._id}
				ref={(el) => { sidebarCardRefs.current[agency._id] = el; }}
				className={`agency-map-card${isActive ? ' active' : ''}`}
				onClick={() => handleCardClick(agency)}
			>
				{agency.logo ? (
					<img className="card-logo" src={`${REACT_APP_API_URL}/uploads/${agency.logo}`} alt={name} />
				) : (
					<div className="card-logo-placeholder">{initial}</div>
				)}
				<div className="card-body">
					<div className="card-name">{name}</div>
					{addressLine && <div className="card-address">{addressLine}</div>}
					{agency.phoneNumber && (
						<a className="card-phone" href={`tel:${agency.phoneNumber}`} onClick={(e) => e.stopPropagation()}>
							{agency.phoneNumber}
						</a>
					)}
					<div className="card-meta">
						{(agency.averageRating ?? 0) > 0 && (
							<div className="card-rating">
								<StarIcon />
								{(agency.averageRating ?? 0).toFixed(1)}
								<span className="card-services"> · {agency.totalServices ?? 0} {ui('services')}</span>
							</div>
						)}
						{agency.verificationStatus === 'VERIFIED' && (
							<div className="card-verified">
								<VerifiedIcon />
								{ui('Verified')}
							</div>
						)}
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="agency-map-page">
			{/* Filter bar */}
			<div className="agency-map-filters">
				<div className="filter-search">
					<SearchIcon />
					<input
						type="text"
						placeholder={ui('Search agencies, cities...')}
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
					/>
				</div>
				<select className="filter-select" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
					<option value="">{ui('All countries')}</option>
					{countries.map((c) => <option key={c} value={c}>{c}</option>)}
				</select>
				<input
					className="filter-select"
					type="text"
					placeholder={ui('City...')}
					value={cityFilter}
					onChange={(e) => setCityFilter(e.target.value)}
					style={{ minWidth: 100 }}
				/>
				{(searchText || countryFilter || cityFilter) && (
					<button className="filter-reset" onClick={handleReset}>{ui('Clear')}</button>
				)}
				<div className="filter-count">
					<span>{agencies.length}</span> {agencies.length === 1 ? ui('agency') : ui('agencies')} {ui('on map')}
				</div>
			</div>

			{/* Split layout */}
			<div className="agency-map-layout">
				{/* LEFT — sidebar */}
				<div className="agency-map-sidebar">
					{loading && (
						<div className="sidebar-loading">
							{Array(5).fill(0).map((_, i) => (
								<div key={i} className="sk-card">
									<div className="sk-img" />
									<div className="sk-body">
										<div style={{ width: '70%' }} />
										<div style={{ width: '90%' }} />
										<div style={{ width: '50%' }} />
									</div>
								</div>
							))}
						</div>
					)}
					{!loading && agencies.length === 0 && (
						<div className="sidebar-empty">
							<LocationOnIcon />
							<strong>{ui('No agencies found')}</strong>
							<span>{ui('Add latitude and longitude to agency profiles to show them on the map.')}</span>
						</div>
					)}
					{agencies.map(renderCard)}
				</div>

				{/* RIGHT — Leaflet map (vanilla) */}
				<div className="agency-map-pane">
					<div ref={mapContainerRef} className="leaflet-map-root" />
				</div>
			</div>
		</div>
	);
};

export default AgencyMapView;
