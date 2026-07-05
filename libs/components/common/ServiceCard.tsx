import React from 'react';
import { Box, Rating } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PublicIcon from '@mui/icons-material/Public';
import { Service } from '../../types/service/service';
import { getServiceTypeLabel, isLiked, formatPrice } from '../../utils';
import { useLang } from '../../utils/lang';
import { useUiLang } from '../../utils/translations';

interface Props {
	service: Service;
	onClick: () => void;
	onLike?: (e: React.MouseEvent) => void;
}

const ServiceCard = ({ service, onClick, onLike }: Props) => {
	const liked = isLiked(service.meLiked);
	const tr = useLang();
	const ui = useUiLang();

	return (
		<Box className="service-card" onClick={onClick}>
			<Box className="service-card-body">
				<div className="service-type-badge">{ui(getServiceTypeLabel(service.serviceType))}</div>

				<div className="service-name">{tr(service.name)}</div>

				<Box className="service-meta">
					<PublicIcon className="meta-icon" />
					<span>{service.destinationCountry || ui('service.global')}</span>
					{service.processingTime && (
						<>
							<span className="meta-dot">·</span>
							<AccessTimeIcon className="meta-icon" />
							<span>{service.processingTime}</span>
						</>
					)}
				</Box>

				<Box className="service-rating-row">
					<Rating value={service.averageRating || 0} precision={0.1} size="small" readOnly />
					<span className="review-count">({service.totalReviews || 0})</span>
				</Box>

				<Box className="service-footer">
					<div className="service-price">{formatPrice(service.price)}</div>
					<Box className="service-actions">
						<Box
							className={`service-action-btn ${liked ? 'liked' : ''}`}
							onClick={(e) => { e.stopPropagation(); onLike?.(e); }}
						>
							{liked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
							<span>{service.likeCount || 0}</span>
						</Box>
						<Box className="service-action-btn comment-btn">
							<ChatBubbleOutlineIcon fontSize="small" />
							<span>{service.totalReviews || 0}</span>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default ServiceCard;
