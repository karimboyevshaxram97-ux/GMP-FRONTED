import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useLazyQuery, useMutation, useReactiveVar } from '@apollo/client';
import { Box, Pagination } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { GET_PHOTOS, GET_PHOTO_COMMENTS } from '../../../apollo/user/query';
import { TOGGLE_LIKE, RECORD_VIEW, CREATE_PHOTO_COMMENT } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { LikeTargetType } from '../../enums/like.enum';
import { avatarSrc } from '../../utils/avatar';
import { useLang } from '../../utils/lang';
import { useUiLang } from '../../utils/translations';

const PAGE_SIZE = 3;

// Foto lavha: tanlangan yo'nalishdagi agentlik suratlari, eng ko'p like
// bosilganlari birinchi — 3 tadan sahifalab ko'rsatiladi. Suratga bosilsa
// katta ko'rinish + izohlar modali ochiladi (ko'rish ham hisoblanadi).
const PhotoBoard = ({ serviceType }: { serviceType?: string }) => {
	const ui = useUiLang();
	const tr = useLang();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<any>(null);
	const [commentText, setCommentText] = useState('');

	const { data, refetch } = useQuery(GET_PHOTOS, {
		fetchPolicy: 'cache-and-network',
		nextFetchPolicy: 'cache-first',
		variables: {
			input: {
				serviceType: serviceType || undefined,
				page,
				limit: PAGE_SIZE,
			},
		},
	});

	const [loadComments, { data: commentsData, refetch: refetchComments }] = useLazyQuery(GET_PHOTO_COMMENTS, {
		fetchPolicy: 'cache-and-network',
	});

	const [toggleLike] = useMutation(TOGGLE_LIKE);
	const [recordView] = useMutation(RECORD_VIEW);
	const [createComment, { loading: commentSending }] = useMutation(CREATE_PHOTO_COMMENT);

	// Yo'nalish almashganda birinchi sahifaga qaytamiz
	useEffect(() => { setPage(1); }, [serviceType]);

	const photos: any[] = data?.getPhotos?.list ?? [];
	const total: number = data?.getPhotos?.metaCounter?.[0]?.total ?? 0;
	const pageCount = Math.ceil(total / PAGE_SIZE);
	const comments: any[] = commentsData?.getPhotoComments ?? [];

	const openPhoto = (photo: any) => {
		setSelected(photo);
		setCommentText('');
		loadComments({ variables: { photoId: photo._id } });
		recordView({ variables: { targetId: photo._id, targetType: 'PHOTO' } })
			.then(() => refetch())
			.catch(() => undefined);
	};

	const handleLike = async (event: React.MouseEvent, photoId: string) => {
		event.stopPropagation();
		if (!user?._id) { router.push('/account/join'); return; }
		await toggleLike({ variables: { targetId: photoId, targetType: LikeTargetType.PHOTO } });
		const result = await refetch();
		// Modal ochiq bo'lsa, undagi surat ma'lumotini ham yangilaymiz
		if (selected) {
			const updated = result?.data?.getPhotos?.list?.find((p: any) => p._id === selected._id);
			if (updated) setSelected(updated);
		}
	};

	const handleComment = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!user?._id) { router.push('/account/join'); return; }
		const text = commentText.trim();
		if (!text || !selected) return;
		await createComment({ variables: { input: { photoId: selected._id, text } } });
		setCommentText('');
		refetchComments?.();
		const result = await refetch();
		const updated = result?.data?.getPhotos?.list?.find((p: any) => p._id === selected._id);
		if (updated) setSelected(updated);
	};

	if (!photos.length) return null;

	const selectedLiked = Boolean(selected?.meLiked?.[0]?.myFavorite);

	return (
		<Box className="photo-board">
			<Box className="photo-board__head">
				<h2>{ui('service.photoBoard')}</h2>
				<p>{ui('service.mostLikedPhotos')}</p>
			</Box>

			<Box className="photo-board__grid">
				{photos.map((photo) => {
					const liked = Boolean(photo.meLiked?.[0]?.myFavorite);

					return (
						<Box key={photo._id} className="photo-card" onClick={() => openPhoto(photo)}>
							<img src={`${REACT_APP_API_URL}/uploads/${photo.image}`} alt="" loading="lazy" />

							<Box className="photo-card__stats">
								<button
									type="button"
									className={`photo-stat photo-stat--like${liked ? ' liked' : ''}`}
									onClick={(event) => handleLike(event, photo._id)}
								>
									{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
									<span>{photo.likeCount ?? 0}</span>
								</button>
								<span className="photo-stat">
									<VisibilityOutlinedIcon />
									<span>{photo.viewCount ?? 0}</span>
								</span>
								<span className="photo-stat">
									<ChatBubbleOutlineIcon />
									<span>{photo.commentCount ?? 0}</span>
								</span>
							</Box>
						</Box>
					);
				})}
			</Box>

			{pageCount > 1 && (
				<Box className="photo-board__pagination">
					<Pagination count={pageCount} page={page} onChange={(_, value) => setPage(value)} color="primary" />
				</Box>
			)}

			{/* Katta ko'rinish + izohlar modali */}
			{selected && (
				<Box className="photo-modal-overlay" onClick={() => setSelected(null)}>
					<Box className="photo-modal" onClick={(event) => event.stopPropagation()}>
						<button type="button" className="photo-modal__close" onClick={() => setSelected(null)} aria-label="Close">
							<CloseIcon />
						</button>

						<Box className="photo-modal__image">
							<img src={`${REACT_APP_API_URL}/uploads/${selected.image}`} alt="" />
						</Box>

						<Box className="photo-modal__side">
							<Box
								className="photo-modal__agency"
								onClick={() => router.push(`/agency/${selected.agency}`)}
							>
								{selected.agencyLogo ? (
									<img src={`${REACT_APP_API_URL}/uploads/${selected.agencyLogo}`} alt="" />
								) : (
									<span className="agency-initial">{(tr(selected.agencyName) || 'A').charAt(0)}</span>
								)}
								<strong>{tr(selected.agencyName)}</strong>
							</Box>

							<Box className="photo-modal__stats">
								<button
									type="button"
									className={`photo-stat photo-stat--like${selectedLiked ? ' liked' : ''}`}
									onClick={(event) => handleLike(event, selected._id)}
								>
									{selectedLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
									<span>{selected.likeCount ?? 0}</span>
								</button>
								<span className="photo-stat">
									<VisibilityOutlinedIcon />
									<span>{selected.viewCount ?? 0}</span>
								</span>
								<span className="photo-stat">
									<ChatBubbleOutlineIcon />
									<span>{selected.commentCount ?? 0}</span>
								</span>
							</Box>

							<Box className="photo-modal__comments">
								{comments.length === 0 ? (
									<p className="no-comments">{ui('service.noCommentsYet')}</p>
								) : (
									comments.map((comment) => (
										<Box key={comment._id} className="photo-comment">
											<img src={avatarSrc(comment.userAvatar)} alt="" />
											<Box>
												<strong>{comment.userName || 'User'}</strong>
												<p>{comment.text}</p>
											</Box>
										</Box>
									))
								)}
							</Box>

							<Box component="form" className="photo-modal__input" onSubmit={handleComment}>
								<input
									type="text"
									value={commentText}
									onChange={(event) => setCommentText(event.target.value)}
									placeholder={ui('service.writeComment')}
									maxLength={500}
								/>
								<button type="submit" disabled={commentSending || !commentText.trim()} aria-label="Send">
									<SendIcon />
								</button>
							</Box>
						</Box>
					</Box>
				</Box>
			)}
		</Box>
	);
};

export default PhotoBoard;
