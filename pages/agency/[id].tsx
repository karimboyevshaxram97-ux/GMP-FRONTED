import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Stack, Box, Button, Rating, Chip, Tabs, Tab, Divider, Skeleton } from '@mui/material';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import EmailIcon from '@mui/icons-material/Email';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LanguageIcon from '@mui/icons-material/Language';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PublicIcon from '@mui/icons-material/Public';
import SendIcon from '@mui/icons-material/Send';
import VerifiedIcon from '@mui/icons-material/Verified';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { GET_AGENCY, REVIEWS_BY_AGENCY } from '../../apollo/user/query';
import { useLang } from '../../libs/utils/lang';
import { TOGGLE_LIKE, FOLLOW_AGENCY, UNFOLLOW_AGENCY, CREATE_OR_GET_CONVERSATION, SEND_MESSAGE, RECORD_VIEW } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { getImageUrl, isLiked, isFollowed } from '../../libs/utils';
import { REACT_APP_API_URL } from '../../libs/config';
import { sweetMixinSuccessAlert } from '../../libs/sweetAlert';
import { LikeTargetType } from '../../libs/enums/like.enum';
import { AgencyVerificationStatus } from '../../libs/enums/agency.enum';
import { useUiLang } from '../../libs/utils/translations';

const AgencyDetail: NextPage = () => {
	const router = useRouter();
	const tr = useLang();
	const ui = useUiLang();
	const agencyId = typeof router.query.id === 'string' ? router.query.id : '';
	const user = useReactiveVar(userVar);
	const [tab, setTab] = useState(0);
	const [showMsgBox, setShowMsgBox] = useState(false);
	const [msgText, setMsgText] = useState('');
	const [msgSending, setMsgSending] = useState(false);
	const [msgSent, setMsgSent] = useState(false);
	const [sentConversationId, setSentConversationId] = useState('');

	const { data, loading, refetch } = useQuery(GET_AGENCY, {
		errorPolicy: 'all',
		fetchPolicy: 'cache-and-network',
		nextFetchPolicy: 'cache-first',
		variables: { id: agencyId },
		skip: !agencyId,
	});

	const { data: reviewData, loading: reviewsLoading } = useQuery(REVIEWS_BY_AGENCY, {
		errorPolicy: 'all',
		variables: { agencyId },
		skip: !agencyId,
	});

	const [toggleLike] = useMutation(TOGGLE_LIKE);
	const [followAgency] = useMutation(FOLLOW_AGENCY, { refetchQueries: ['MyFollowingAgencies'] });
	const [unfollowAgency] = useMutation(UNFOLLOW_AGENCY, { refetchQueries: ['MyFollowingAgencies'] });
	const [createConversation] = useMutation(CREATE_OR_GET_CONVERSATION);
	const [sendMessage] = useMutation(SEND_MESSAGE);
	const [recordView] = useMutation(RECORD_VIEW);

	const fetchedAgency = data?.getAgency;
	const agency = fetchedAgency?.status === 'ACTIVE' && fetchedAgency?.verificationStatus === AgencyVerificationStatus.VERIFIED
		? fetchedAgency
		: null;

	useEffect(() => {
		if (agency?._id) {
			recordView({ variables: { targetId: agency._id, targetType: 'AGENCY' } }).catch(() => {});
		}
	}, [agency?._id, recordView]);
	const reviews = reviewData?.reviewsByAgency ?? [];

	const requireLogin = () => {
		if (!user?._id) {
			router.push('/account/join');
			return false;
		}
		return true;
	};

	const handleLike = async () => {
		if (!requireLogin() || !agency) return;
		await toggleLike({ variables: { targetId: agency._id, targetType: LikeTargetType.AGENCY } });
		refetch();
	};

	const handleFollow = async () => {
		if (!requireLogin() || !agency) return;
		const followed = isFollowed(agency.meFollowed);
		if (followed) {
			await unfollowAgency({ variables: { agencyId: agency._id } });
		} else {
			await followAgency({ variables: { agencyId: agency._id } });
		}
		await sweetMixinSuccessAlert(followed ? ui('agency.unfollowed') : ui('agency.followingAgency'));
		refetch();
	};

	const handleMessageBtn = () => {
		if (!requireLogin()) return;
		setShowMsgBox(true);
		setMsgSent(false);
	};

	const handleSendMsg = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!msgText.trim() || !agency || msgSending) return;
		setMsgSending(true);
		try {
			const convResult = await createConversation({
				variables: { input: { recipientId: agency.owner, agencyId: agency._id } },
			});
			const convId = convResult?.data?.createOrGetConversation?._id;
			if (!convId) return;
			await sendMessage({ variables: { input: { conversationId: convId, text: msgText.trim() } } });
			setSentConversationId(convId);
			setMsgText('');
			setMsgSent(true);
		} finally {
			setMsgSending(false);
		}
	};

	if (loading || !agencyId) {
		return (
			<div className="agency-detail">
				<Stack className="container">
					<Box className="agency-profile-loading">
						<Skeleton variant="rectangular" width={112} height={112} />
						<Box sx={{ flex: 1 }}>
							<Skeleton height={42} width="55%" />
							<Skeleton height={22} width="75%" />
							<Skeleton height={22} width="38%" />
						</Box>
					</Box>
				</Stack>
			</div>
		);
	}

	if (!agency) {
		return (
			<div className="agency-detail">
				<Stack className="container">
					<Box className="agency-not-found">
						<h1>{ui('agency.agencyNotFound')}</h1>
						<p>{ui('agency.thisProfileMayHaveBeen')}</p>
						<Button variant="contained" onClick={() => router.push('/agency')}>
							{ui('agency.backToAgencies')}
						</Button>
					</Box>
				</Stack>
			</div>
		);
	}

	const coverSrc = (agency as any).coverImage
		? `${REACT_APP_API_URL}/uploads/${(agency as any).coverImage}`
		: agency.logo
		? `${REACT_APP_API_URL}/uploads/${agency.logo}`
		: '/img/hero-bg1.jpg';
	const isOwnAgency = !!user?._id && agency.owner === user._id;

	return (
		<div className="agency-detail">
			{/* Cover image hero */}
			<Box className="agency-cover-hero" style={{ backgroundImage: `url('${coverSrc}')` }}>
				<Box className="cover-overlay" />
				<Stack className="container">
					<Button className="back-button" startIcon={<ArrowBackIcon />} onClick={() => router.push('/agency')}>
						{ui('agency.agencies')}
					</Button>

					<Box className="profile-hero-grid">
						<Box className="agency-identity">
							<img className="agency-logo" src={getImageUrl(agency.logo, '/img/hero-bg1.jpg')} alt={tr(agency.name)} />
							<Box>
								<Box className="badge-row">
									{agency.verificationStatus === AgencyVerificationStatus.VERIFIED && (
										<Chip icon={<VerifiedIcon />} label={ui('agency.verifiedAgency')} className="verified-chip" />
									)}
									<Chip label={agency.status} className="status-chip" />
								</Box>
								<h1>{tr(agency.name) || ui('auth.agency')}</h1>
								<p>{tr(agency.description) || ui('agency.defaultProfileDescription')}</p>
								<Box className="rating-summary">
									<Rating value={agency.averageRating || 0} precision={0.1} readOnly />
									<strong>{(agency.averageRating || 0).toFixed(1)}</strong>
									<span>{agency.totalReviews || 0} {ui('agency.reviews2')}</span>
								</Box>
							</Box>
						</Box>

						<Box className="profile-metrics">
							<Box>
								<WorkOutlineIcon />
								<span>{ui('agency.services')}</span>
								<strong>{agency.totalServices || 0}</strong>
							</Box>
							<Box>
								<VisibilityIcon />
								<span>{ui('agency.views')}</span>
								<strong>{agency.viewCount || 0}</strong>
							</Box>
							<Box>
								<FavoriteBorderIcon />
								<span>{ui('agency.likes')}</span>
								<strong>{agency.likeCount || 0}</strong>
							</Box>
						</Box>
					</Box>
				</Stack>
			</Box>

			<Stack className="container">
				<Box className="detail-layout">
					<Box className="profile-main" key={`pm-${tab}`}>
						<Tabs value={tab} onChange={(_, value) => setTab(value)} className="profile-tabs">
							<Tab label={ui('agency.about')} />
							<Tab label={`${ui('agency.reviews')} (${reviews.length})`} />
						</Tabs>

						{tab === 0 && (
							<Box className="profile-section">
								<h2>{ui('agency.aboutThisAgency')}</h2>
								<p>{tr(agency.description) || ui('agency.noDescriptionHasBeenAdded')}</p>

								<Divider sx={{ my: 3 }} />

								<h3>{ui('agency.operatingCountries')}</h3>
								{agency.operatingCountries?.length ? (
									<Box className="country-list">
										{agency.operatingCountries.map((country: string) => (
											<Chip key={country} icon={<PublicIcon />} label={country} />
										))}
									</Box>
								) : (
									<Box className="empty-inline">{ui('agency.noOperatingCountriesListedYet')}</Box>
								)}
							</Box>
						)}

						{tab === 1 && (
							<Box className="profile-section">
								<h2>{ui('agency.clientReviews')}</h2>
								{reviewsLoading ? (
									<Box>
										<Skeleton height={72} />
										<Skeleton height={72} />
									</Box>
								) : reviews.length ? (
									reviews.map((review: any) => (
										<Box key={review._id} className="review-item">
											<Box className="review-head">
												<Rating value={review.rating} size="small" readOnly />
												<span>{new Date(review.createdAt).toLocaleDateString()}</span>
											</Box>
											<p>{review.comment || ui('agency.noCommentProvided')}</p>
										</Box>
									))
								) : (
									<Box className="empty-inline">{ui('agency.noReviewsYet')}</Box>
								)}
							</Box>
						)}
					</Box>

					<Box className="contact-card" key={`cc-${tab}`}>
						<h3>{ui('agency.contactAgency')}</h3>
						<p>{ui('agency.useTheAvailableChannelsOr')}</p>

						<Box className="contact-list">
							{agency.email && (
								<Box>
									<EmailIcon />
									<span>{agency.email}</span>
								</Box>
							)}
							{agency.phoneNumber && (
								<Box>
									<PhoneIcon />
									<span>{agency.phoneNumber}</span>
								</Box>
							)}
							{agency.website && (
								<Box>
									<LanguageIcon />
									<a href={agency.website} target="_blank" rel="noopener noreferrer">
										{agency.website}
									</a>
								</Box>
							)}
							{!agency.email && !agency.phoneNumber && !agency.website && (
								<Box className="empty-contact">{ui('agency.noPublicContactDetailsYet')}</Box>
							)}
						</Box>

						{isOwnAgency ? (
							<Button fullWidth variant="outlined" disabled>
								{ui('agency.thisIsYourAgency')}
							</Button>
						) : !showMsgBox ? (
							<Button fullWidth variant="contained" startIcon={<SendIcon />} onClick={handleMessageBtn}>
								{ui('agency.sendMessage')}
							</Button>
						) : msgSent ? (
							<Box className="msg-sent-box">
								<span>{ui('agency.messageSent')}</span>
								<Box className="msg-sent-actions">
									<Button size="small" onClick={() => { setShowMsgBox(false); setMsgSent(false); setSentConversationId(''); }}>
										{ui('agency.sendAnother')}
									</Button>
									<Button
										size="small"
										variant="contained"
										onClick={() => router.push(sentConversationId ? `/mypage/messages?id=${sentConversationId}` : '/mypage/messages')}
									>
										{ui('agency.openMessages')}
									</Button>
								</Box>
							</Box>
						) : (
							<Box component="form" className="inline-msg-box" onSubmit={handleSendMsg}>
								<textarea
									className="inline-msg-textarea"
									placeholder={ui('agency.writeYourMessageToThis')}
									rows={4}
									value={msgText}
									onChange={(e) => setMsgText(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter' && !e.shiftKey) {
											e.preventDefault();
											handleSendMsg(e as any);
										}
									}}
									autoFocus
								/>
								<Box className="inline-msg-footer">
									<Button size="small" onClick={() => setShowMsgBox(false)}>
										{ui('agency.cancel')}
									</Button>
									<Button
										type="submit"
										size="small"
										variant="contained"
										startIcon={msgSending ? undefined : <SendIcon />}
										disabled={!msgText.trim() || msgSending}
									>
										{msgSending ? ui('agency.sending') : ui('common.send')}
									</Button>
								</Box>
							</Box>
						)}
						<Button
							fullWidth
							variant="outlined"
							startIcon={isFollowed(agency.meFollowed) ? <CheckIcon /> : <PersonAddIcon />}
							onClick={handleFollow}
						>
							{isFollowed(agency.meFollowed) ? ui('agency.following') : ui('agency.followAgency')}
						</Button>
						<Button
							fullWidth
							variant="text"
							startIcon={isLiked(agency.meLiked) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
							onClick={handleLike}
							className={isLiked(agency.meLiked) ? 'liked-action' : ''}
						>
							{agency.likeCount || 0} {ui('agency.likes2')}
						</Button>
					</Box>
				</Box>
			</Stack>
		</div>
	);
};

export default withLayoutBasic(AgencyDetail);

export { i18nServerSideProps as getServerSideProps } from '../../libs/i18n';
