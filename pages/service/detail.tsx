import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Stack, Box, Button, Rating, Chip, Divider, TextField, Skeleton } from '@mui/material';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PublicIcon from '@mui/icons-material/Public';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SendIcon from '@mui/icons-material/Send';
import VerifiedIcon from '@mui/icons-material/Verified';
import { GET_SERVICE, REVIEWS_BY_SERVICE } from '../../apollo/user/query';
import { TOGGLE_LIKE, CREATE_APPLICATION, CREATE_REVIEW, RECORD_VIEW } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { LikeTargetType } from '../../libs/enums/like.enum';
import { getServiceTypeLabel, isLiked, formatPrice } from '../../libs/utils';
import { useLang } from '../../libs/utils/lang';
import { sweetMixinSuccessAlert, sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { applicationErrorMessage, toFriendlyError } from '../../libs/utils/errors';
import { useUiLang } from '../../libs/utils/translations';

const ServiceDetail: NextPage = () => {
	const router = useRouter();
	const tr = useLang();
	const ui = useUiLang();
	const serviceId = typeof router.query.id === 'string' ? router.query.id : '';
	const user = useReactiveVar(userVar);
	const [reviewRating, setReviewRating] = useState<number>(5);
	const [reviewComment, setReviewComment] = useState('');
	const [applying, setApplying] = useState(false);
	const [reviewSubmitting, setReviewSubmitting] = useState(false);

	const { data, loading, refetch } = useQuery(GET_SERVICE, { variables: { id: serviceId }, skip: !serviceId });
	const { data: reviewData, refetch: refetchReviews } = useQuery(REVIEWS_BY_SERVICE, { variables: { serviceId }, skip: !serviceId });

	const [toggleLike] = useMutation(TOGGLE_LIKE);
	const [createApplication] = useMutation(CREATE_APPLICATION);
	const [createReview] = useMutation(CREATE_REVIEW);
	const [recordView] = useMutation(RECORD_VIEW);

	const service = data?.getService;

	useEffect(() => {
		if (service?._id) {
			recordView({ variables: { targetId: service._id, targetType: 'SERVICE' } }).catch(() => {});
		}
	}, [service?._id, recordView]);
	const reviews = reviewData?.reviewsByService ?? [];
	const isServiceFull = Number.isFinite(service?.maxApplicationCount)
		&& service.maxApplicationCount > 0
		&& (service.currentApplicationCount ?? 0) >= service.maxApplicationCount;

	const requireLogin = () => {
		if (!user?._id) {
			router.push('/account/join');
			return false;
		}
		return true;
	};

	const handleLike = async () => {
		if (!requireLogin() || !service) return;
		await toggleLike({ variables: { targetId: service._id, targetType: LikeTargetType.SERVICE } });
		refetch();
	};

	const handleApply = async () => {
		if (!requireLogin() || !service || applying || isServiceFull) return;
		setApplying(true);
		try {
			await createApplication({ variables: { input: { serviceId: service._id } } });
			await sweetMixinSuccessAlert(ui('Application submitted successfully!'));
			refetch();
		} catch (err: any) {
			await sweetMixinErrorAlert(applicationErrorMessage(err));
		} finally {
			setApplying(false);
		}
	};

	const handleReview = async () => {
		if (!requireLogin() || !service || reviewSubmitting) return;
		if (!reviewComment.trim()) return sweetMixinErrorAlert(ui('Please write a comment'));
		setReviewSubmitting(true);
		try {
			await createReview({
				variables: { input: { agencyId: service.agency, serviceId: service._id, rating: reviewRating, comment: reviewComment } },
			});
			setReviewComment('');
			await sweetMixinSuccessAlert(ui('Your review was sent for moderation'));
		} catch (err: any) {
			await sweetMixinErrorAlert(toFriendlyError(err, ui('Failed to submit review')));
		} finally {
			setReviewSubmitting(false);
		}
	};

	if (loading || !serviceId) {
		return (
			<div className="service-detail-page">
				<Stack className="container">
					<Box className="service-detail-loading">
						<Skeleton height={42} width="55%" />
						<Skeleton height={24} width="72%" />
						<Skeleton height={160} />
					</Box>
				</Stack>
			</div>
		);
	}

	if (!service) {
		return (
			<div className="service-detail-page">
				<Stack className="container">
					<Box className="service-detail-empty">
						<h1>{ui('Service not found')}</h1>
						<p>{ui('This service may no longer be available.')}</p>
						<Button variant="contained" onClick={() => router.push('/service')}>
							{ui('Back to services')}
						</Button>
					</Box>
				</Stack>
			</div>
		);
	}

	return (
		<div className="service-detail-page">
			<Box className="service-detail-hero">
				<Stack className="container">
					<Button className="back-button" startIcon={<ArrowBackIcon />} onClick={() => router.push('/service')}>
						{ui('Services')}
					</Button>
					<Box className="service-detail-grid">
						<Box className="service-intro">
							<Chip icon={<VerifiedIcon />} label={ui(getServiceTypeLabel(service.serviceType))} className="service-type-chip" />
							<h1>{tr(service.name)}</h1>
							<p>{tr(service.description) || ui('A trusted service designed to support your migration journey.')}</p>
							<Box className="service-rating">
								<Rating value={service.averageRating || 0} precision={0.1} readOnly />
								<strong>{(service.averageRating || 0).toFixed(1)}</strong>
								<span>{service.totalReviews || 0} {ui('reviews')}</span>
							</Box>
						</Box>
						<Box className="price-panel">
							<span>{ui('Service price')}</span>
							<strong>{formatPrice(service.price)}</strong>
							<p>{service.processingTime ? `${ui('Processing')}: ${service.processingTime}` : ui('Processing time depends on the case.')}</p>
							<Button fullWidth variant="contained" onClick={handleApply} disabled={applying || isServiceFull}>
								{applying ? ui('Submitting...') : isServiceFull ? ui('Application limit reached') : ui('Apply now')}
							</Button>
							<Button
								fullWidth
								variant="outlined"
								startIcon={isLiked(service.meLiked) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
								onClick={handleLike}
							>
								{service.likeCount || 0} {ui('likes')}
							</Button>
						</Box>
					</Box>
				</Stack>
			</Box>

			<Stack className="container">
				<Box className="service-content-layout">
					<Box className="service-main-card">
						<h2>{ui('Service details')}</h2>
						<p>{tr(service.description) || ui('No description provided.')}</p>
						<Divider sx={{ my: 3 }} />
						<Box className="service-facts">
							<Box>
								<PublicIcon />
								<span>{ui('Destination')}</span>
								<strong>{service.destinationCountry}</strong>
							</Box>
							{service.processingTime && (
								<Box>
									<ScheduleIcon />
									<span>{ui('Processing time')}</span>
									<strong>{service.processingTime}</strong>
								</Box>
							)}
						</Box>
						{service.sourceCountries?.length > 0 && (
							<Box className="eligible-countries">
								<h3>{ui('Eligible countries')}</h3>
								<Box>
									{service.sourceCountries.map((country: string) => (
										<Chip key={country} label={country} />
									))}
								</Box>
							</Box>
						)}
					</Box>

					<Box className="service-main-card">
						<h2>{ui('Reviews')} ({reviews.length})</h2>
						{reviews.length ? (
							reviews.map((review: any) => (
								<Box key={review._id} className="service-review">
									<Rating value={review.rating} size="small" readOnly />
									<p>{review.comment || ui('No comment provided.')}</p>
								</Box>
							))
						) : (
							<Box className="empty-services">{ui('No reviews yet.')}</Box>
						)}

						{user?._id && (
							<Box className="review-form">
								<h3>{ui('Write a review')}</h3>
								<Rating value={reviewRating} onChange={(_, value) => setReviewRating(value ?? 5)} />
								<TextField
									fullWidth
									multiline
									rows={3}
									placeholder={ui('Share your experience...')}
									value={reviewComment}
									onChange={(event) => setReviewComment(event.target.value)}
								/>
								<Button variant="contained" startIcon={<SendIcon />} onClick={handleReview} disabled={reviewSubmitting}>
									{reviewSubmitting ? ui('Submitting...') : ui('Submit review')}
								</Button>
							</Box>
						)}
					</Box>
				</Box>
			</Stack>
		</div>
	);
};

export default withLayoutBasic(ServiceDetail);

export { i18nStaticProps as getStaticProps } from '../../libs/i18n';
