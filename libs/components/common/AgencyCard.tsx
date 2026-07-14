import React from 'react';
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
import { getImageUrl, isLiked, truncateText } from '../../utils';
import { useLang } from '../../utils/lang';
import { REACT_APP_API_URL } from '../../config';
import { useUiLang } from '../../utils/translations';

interface Props {
	agency: Agency;
	onClick: () => void;
	onLike?: (e: React.MouseEvent) => void;
}

const AgencyCard = ({ agency, onClick, onLike }: Props) => {
	const tr = useLang();
	const ui = useUiLang();
	const countries = agency.operatingCountries ?? [];
	const description = tr(agency.description) || ui('agency.defaultCardDescription');
	const liked = isLiked(agency.meLiked);
	const cardImageUrl = (agency as any).coverImage
		? `${REACT_APP_API_URL}/uploads/${(agency as any).coverImage}`
		: getImageUrl(agency.logo, '/img/hero-bg.jpg');

	return (
		<Box className="agency-card" onClick={onClick}>
			<Box className="card-image">
				<img
					src={cardImageUrl}
					alt={tr(agency.name)}
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

				<Box className="agency-metrics">
					<span>
						<WorkOutlineIcon />
						{agency.totalServices || 0} {ui('admin.services')}
					</span>
					<span>
						<VisibilityIcon />
						{agency.viewCount || 0} {ui('agency.views2')}
					</span>
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
					<Button className="profile-button" endIcon={<ArrowForwardIcon />}>
						{ui('common.view')}
					</Button>
				</Box>
			</Box>
		</Box>
	);
};

export default AgencyCard;
