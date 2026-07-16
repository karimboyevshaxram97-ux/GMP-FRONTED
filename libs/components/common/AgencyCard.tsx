import React, { useState } from 'react';
import { Box, Button, Chip, Rating } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PublicIcon from '@mui/icons-material/Public';
import VerifiedIcon from '@mui/icons-material/Verified';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { Agency } from '../../types/agency/agency';
import { AgencyVerificationStatus } from '../../enums/agency.enum';
import { ServiceType } from '../../enums/service.enum';
import { getImageUrl, isLiked, truncateText } from '../../utils';
import { useLang } from '../../utils/lang';
import { REACT_APP_API_URL } from '../../config';
import { useUiLang } from '../../utils/translations';

interface Props {
	agency: Agency;
	onClick: () => void;
	onLike?: (e: React.MouseEvent) => void;
}

// Agency'da haqiqiy kategoriya maydoni yo'q — shuning uchun _id bo'yicha
// barqaror (har doim bir xil) taqsimlash orqali 4 ta fallback rasmdan biri tanlanadi.
const CATEGORY_FALLBACKS: Record<ServiceType, string> = {
	[ServiceType.STUDY_ABROAD]: '/images/agencies/default-study.webp',
	[ServiceType.WORK_ABROAD]: '/images/agencies/default-work.webp',
	[ServiceType.TRAVEL]: '/images/agencies/default-travel.webp',
	[ServiceType.VISA_SERVICES]: '/images/agencies/default-visa.webp',
};
const FALLBACK_CATEGORIES = Object.values(ServiceType) as ServiceType[];

const getCategoryFallback = (id: string): string => {
	let hash = 0;
	for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
	return CATEGORY_FALLBACKS[FALLBACK_CATEGORIES[hash % FALLBACK_CATEGORIES.length]];
};

const AgencyCard = ({ agency, onClick, onLike }: Props) => {
	const tr = useLang();
	const ui = useUiLang();
	const countries = agency.operatingCountries ?? [];
	const description = tr(agency.description) || ui('agency.defaultCardDescription');
	const liked = isLiked(agency.meLiked);
	const coverImage = (agency as any).coverImage;
	const [imgFailed, setImgFailed] = useState(false);
	const categoryFallback = getCategoryFallback(agency._id);
	// Cover rasm bo'lmasa logo ko'rsatiladi — logo qirqilmasligi uchun
	// "contain" rejimida (card-image--logo), foni esa xiralashtirilgan nusxa.
	const isLogoFallback = !coverImage && !!agency.logo && !imgFailed;
	const cardImageUrl = imgFailed
		? categoryFallback
		: coverImage
		? `${REACT_APP_API_URL}/uploads/${coverImage}`
		: getImageUrl(agency.logo, categoryFallback);

	return (
		<Box className="agency-card" onClick={onClick}>
			<Box className={`card-image${isLogoFallback ? ' card-image--logo' : ''}`}>
				<img
					className="card-image__backdrop"
					src={cardImageUrl}
					alt=""
					aria-hidden="true"
					onError={() => setImgFailed(true)}
				/>
				<img
					className="card-image__photo"
					src={cardImageUrl}
					alt={tr(agency.name)}
					loading="lazy"
					onError={() => setImgFailed(true)}
				/>
				{agency.verificationStatus === AgencyVerificationStatus.VERIFIED && (
					<Chip className="verified-badge" icon={<VerifiedIcon />} label={ui('admin.verified')} />
				)}
			</Box>

			<Box className="card-body">
				<Box className="agency-title-row">
					<h3>{tr(agency.name)}</h3>
					<span>{(agency.averageRating || 0).toFixed(1)}</span>
				</Box>

				<p className="agency-description">{truncateText(description, 116)}</p>

				<Box className="country-row">
					<PublicIcon />
					<span>{countries.length ? countries.slice(0, 3).join(', ') : ui('agency.globalSupport')}</span>
				</Box>

				<Box className="rating-row">
					<Rating value={agency.averageRating || 0} precision={0.1} size="small" readOnly />
					<span>{agency.totalReviews || 0} {ui('agency.reviews2')}</span>
				</Box>

				<Box className="card-actions">
					<Box
						className={`action-btn like-action ${liked ? 'liked' : ''}`}
						onClick={(e) => { e.stopPropagation(); onLike?.(e); }}
					>
						{liked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
						<span>{agency.likeCount || 0}</span>
					</Box>
					<Box className="action-btn comment-action">
						<ChatBubbleOutlineIcon fontSize="small" />
						<span>{agency.totalReviews || 0}</span>
					</Box>
					<Box
						className="action-btn metric-action"
						aria-label={`${agency.totalServices || 0} ${ui('admin.services')}`}
						title={`${agency.totalServices || 0} ${ui('admin.services')}`}
					>
						<WorkOutlineIcon fontSize="small" />
					</Box>
					<Box
						className="action-btn metric-action"
						aria-label={`${agency.viewCount || 0} ${ui('agency.views2')}`}
						title={`${agency.viewCount || 0} ${ui('agency.views2')}`}
					>
						<VisibilityIcon fontSize="small" />
					</Box>
					<Button className="profile-button" endIcon={<ArrowForwardIcon />}>
						{ui('common.view')}
					</Button>
				</Box>
			</Box>
		</Box>
	);
};

export default AgencyCard;
