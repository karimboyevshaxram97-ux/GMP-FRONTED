import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useQuery, useLazyQuery, useMutation, useReactiveVar } from '@apollo/client';
import { Box, Pagination } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import { GET_PHOTOS, GET_PHOTO_COMMENTS } from '../../../apollo/user/query';
import { TOGGLE_LIKE, RECORD_VIEW, CREATE_PHOTO_COMMENT } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { LikeTargetType } from '../../enums/like.enum';
import { ViewTargetType } from '../../enums/view.enum';
import { useLang } from '../../utils/lang';
import { useUiLang } from '../../utils/translations';
import { getJwtToken } from '../../auth';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { getServiceTypeLabel } from '../../utils';
import PhotoCommentThread from '../common/PhotoCommentThread';

// PhotoBoard `pages/service/index.tsx` orqali getStaticProps bilan build vaqtida
// SSR qilinadi — brauzer-only kutubxonani statik import qilish next build'ni buzadi.
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

const PAGE_SIZE = 3;
const MAX_COMMENT_IMAGES = 4;
const MAX_COMMENT_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_COMMENT_VIDEO_SIZE = 50 * 1024 * 1024;

interface StagedAttachment {
	file: File;
	previewUrl: string;
}

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
	const [stagedImages, setStagedImages] = useState<StagedAttachment[]>([]);
	const [stagedVideo, setStagedVideo] = useState<StagedAttachment | null>(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [attachmentSending, setAttachmentSending] = useState(false);
	const [lightboxImage, setLightboxImage] = useState<string | null>(null);
	const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const videoInputRef = useRef<HTMLInputElement>(null);
	const commentInputRef = useRef<HTMLInputElement>(null);

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
	const replyCopy = (key: 'service.replyingTo' | 'service.replyPlaceholder' | 'service.cancelReply', name = '') => {
		const translated = ui(key);
		if (translated !== key) return translated.replace('{{name}}', name);
		if (key === 'service.replyingTo') return `${name} ga javob yozyapsiz`;
		if (key === 'service.replyPlaceholder') return `${name} ga javob yozing...`;
		return 'Javob berishni bekor qilish';
	};

	const openPhoto = (photo: any) => {
		setSelected(photo);
		setCommentText('');
		setStagedImages([]);
		setStagedVideo(null);
		setShowEmojiPicker(false);
		setLightboxImage(null);
		setReplyingTo(null);
		loadComments({ variables: { photoId: photo._id } });
		recordView({ variables: { targetId: photo._id, targetType: ViewTargetType.PHOTO } })
			.then(() => refetch())
			.catch(() => undefined);
	};

	const handleCommentLike = async (comment: any) => {
		if (!user?._id) { router.push('/account/join'); return; }
		await toggleLike({
			variables: { targetId: comment._id, targetType: LikeTargetType.PHOTO_COMMENT },
		});
		await refetchComments?.();
	};

	const handleReply = (comment: any) => {
		setReplyingTo({ id: comment._id, name: comment.userName || 'User' });
		requestAnimationFrame(() => commentInputRef.current?.focus());
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

	// Rasm(lar) tanlansa video bekor qilinadi va aksincha — bitta izohda 4 tagacha
	// rasm YOKI bitta video bo'lishi mumkin, aralash emas (backend ham shu qoidani tekshiradi).
	const handleSelectImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);
		event.target.value = '';
		if (!files.length) return;

		const oversized = files.find((file) => file.size > MAX_COMMENT_IMAGE_SIZE);
		if (oversized) {
			await sweetMixinErrorAlert(ui('service.fileTooLarge'));
			return;
		}

		if (stagedVideo) {
			URL.revokeObjectURL(stagedVideo.previewUrl);
			setStagedVideo(null);
		}

		const newItems = files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
		setStagedImages((prev) => {
			const combined = [...prev, ...newItems];
			if (combined.length > MAX_COMMENT_IMAGES) {
				sweetMixinErrorAlert(ui('service.maxImagesReached'));
				combined.slice(MAX_COMMENT_IMAGES).forEach((item) => URL.revokeObjectURL(item.previewUrl));
				return combined.slice(0, MAX_COMMENT_IMAGES);
			}
			return combined;
		});
	};

	const handleSelectVideo = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = '';
		if (!file) return;

		if (file.size > MAX_COMMENT_VIDEO_SIZE) {
			await sweetMixinErrorAlert(ui('service.fileTooLarge'));
			return;
		}

		stagedImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
		setStagedImages([]);
		if (stagedVideo) URL.revokeObjectURL(stagedVideo.previewUrl);
		setStagedVideo({ file, previewUrl: URL.createObjectURL(file) });
	};

	const removeStagedImage = (index: number) => {
		setStagedImages((prev) => {
			const target = prev[index];
			if (target) URL.revokeObjectURL(target.previewUrl);
			return prev.filter((_, i) => i !== index);
		});
	};

	const removeStagedVideo = () => {
		if (stagedVideo) URL.revokeObjectURL(stagedVideo.previewUrl);
		setStagedVideo(null);
	};

	const handleEmojiClick = (emojiData: { emoji: string }) => {
		setCommentText((prev) => prev + emojiData.emoji);
	};

	const uploadCommentAttachment = async (file: File, kind: 'image' | 'video'): Promise<string> => {
		const formData = new FormData();
		formData.append('file', file);
		const token = getJwtToken();
		const endpoint = kind === 'video' ? 'upload/video' : 'upload/image?type=comment';
		const res = await fetch(`${REACT_APP_API_URL}/${endpoint}`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: formData,
		});
		if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Upload failed');
		const data = await res.json();
		return data.url as string;
	};

	const handleComment = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!user?._id) { router.push('/account/join'); return; }
		const text = commentText.trim();
		if (!text && !stagedImages.length && !stagedVideo) return;
		if (!selected) return;

		setAttachmentSending(true);
		try {
			const toUpload: { file: File; kind: 'image' | 'video' }[] = stagedVideo
				? [{ file: stagedVideo.file, kind: 'video' }]
				: stagedImages.map((item) => ({ file: item.file, kind: 'image' as const }));

			const attachmentUrls = await Promise.all(
				toUpload.map(({ file, kind }) => uploadCommentAttachment(file, kind)),
			);

			await createComment({
				variables: {
					input: {
						photoId: selected._id,
						parentCommentId: replyingTo?.id || undefined,
						text: text || undefined,
						attachmentUrls: attachmentUrls.length ? attachmentUrls : undefined,
					},
				},
			});

			setCommentText('');
			stagedImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
			if (stagedVideo) URL.revokeObjectURL(stagedVideo.previewUrl);
			setStagedImages([]);
			setStagedVideo(null);
			setShowEmojiPicker(false);
			setReplyingTo(null);
			refetchComments?.();
			const result = await refetch();
			const updated = result?.data?.getPhotos?.list?.find((p: any) => p._id === selected._id);
			if (updated) setSelected(updated);
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || ui('errors.failedToSendComment'));
		} finally {
			setAttachmentSending(false);
		}
	};

	if (!photos.length) return null;

	const selectedLiked = Boolean(selected?.meLiked?.[0]?.myFavorite);

	return (
		<Box className={`photo-board photo-board--${(serviceType || 'all').toLowerCase().replace(/_/g, '-')}`}>
			<Box className="photo-board__head">
				<Box>
					<span className="photo-board__kicker">{ui(getServiceTypeLabel(serviceType || ''))}</span>
					<h2>{ui('service.photoBoard')}</h2>
					<p>{ui('service.mostLikedPhotos')}</p>
				</Box>
				<strong>{String(total).padStart(2, '0')}</strong>
			</Box>

			<Box className="photo-board__grid">
				{photos.map((photo, index) => {
					const liked = Boolean(photo.meLiked?.[0]?.myFavorite);

					return (
						<Box key={photo._id} className="photo-card" onClick={() => openPhoto(photo)}>
							<img src={`${REACT_APP_API_URL}/uploads/${photo.image}`} alt="" loading="lazy" />
							<span className="photo-card__rank">{String(index + 1).padStart(2, '0')}</span>

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
									<PhotoCommentThread
										comments={comments}
										replyLabel={ui('service.reply')}
										onLike={handleCommentLike}
										onReply={handleReply}
										onImageClick={setLightboxImage}
									/>
								)}
							</Box>

							<Box className="photo-modal__input-wrap">
								{replyingTo && (
									<Box className="photo-modal__replying">
										<span>{replyCopy('service.replyingTo', replyingTo.name)}</span>
										<button type="button" onClick={() => setReplyingTo(null)} aria-label={replyCopy('service.cancelReply')}>
											<CloseIcon />
										</button>
									</Box>
								)}
								{(stagedImages.length > 0 || stagedVideo) && (
									<Box className="photo-modal__attachments-preview">
										{stagedImages.map((item, index) => (
											<Box key={index} className="staged-attachment">
												<img src={item.previewUrl} alt="" />
												<button type="button" onClick={() => removeStagedImage(index)} aria-label={ui('service.removeAttachment')}>
													<CloseIcon fontSize="small" />
												</button>
											</Box>
										))}
										{stagedVideo && (
											<Box className="staged-attachment">
												<video src={stagedVideo.previewUrl} />
												<button type="button" onClick={removeStagedVideo} aria-label={ui('service.removeAttachment')}>
													<CloseIcon fontSize="small" />
												</button>
											</Box>
										)}
									</Box>
								)}

								{showEmojiPicker && (
									<Box className="photo-modal__emoji-popover">
										<EmojiPicker onEmojiClick={handleEmojiClick} height={320} width="100%" />
									</Box>
								)}

								<Box component="form" className="photo-modal__input" onSubmit={handleComment}>
									<input
										type="file"
										ref={imageInputRef}
										accept="image/jpeg,image/png,image/webp"
										multiple
										hidden
										onChange={handleSelectImages}
									/>
									<input
										type="file"
										ref={videoInputRef}
										accept="video/mp4,video/webm,video/quicktime"
										hidden
										onChange={handleSelectVideo}
									/>
									<button
										type="button"
										className="attach-btn"
										onClick={() => imageInputRef.current?.click()}
										disabled={!!stagedVideo}
										aria-label={ui('service.addImage')}
									>
										<ImageOutlinedIcon fontSize="small" />
									</button>
									<button
										type="button"
										className="attach-btn"
										onClick={() => videoInputRef.current?.click()}
										disabled={stagedImages.length > 0}
										aria-label={ui('service.addVideo')}
									>
										<VideocamOutlinedIcon fontSize="small" />
									</button>
									<button
										type="button"
										className={`attach-btn${showEmojiPicker ? ' active' : ''}`}
										onClick={() => setShowEmojiPicker((prev) => !prev)}
										aria-label={ui('service.addEmoji')}
									>
										<EmojiEmotionsOutlinedIcon fontSize="small" />
									</button>
									<input
										type="text"
										ref={commentInputRef}
										value={commentText}
										onChange={(event) => setCommentText(event.target.value)}
										placeholder={replyingTo ? replyCopy('service.replyPlaceholder', replyingTo.name) : ui('service.writeComment')}
										maxLength={500}
									/>
									<button
										type="submit"
										disabled={
											commentSending ||
											attachmentSending ||
											(!commentText.trim() && !stagedImages.length && !stagedVideo)
										}
										aria-label="Send"
									>
										<SendIcon />
									</button>
								</Box>
							</Box>
						</Box>
					</Box>
				</Box>
			)}

			{/* Izohga qo'shilgan rasmni kattalashtirib ko'rish uchun lightbox */}
			{lightboxImage && (
				<Box className="attachment-lightbox" onClick={() => setLightboxImage(null)}>
					<button
						type="button"
						className="attachment-lightbox__close"
						onClick={() => setLightboxImage(null)}
						aria-label="Close"
					>
						<CloseIcon />
					</button>
					<img src={lightboxImage} alt="" onClick={(event) => event.stopPropagation()} />
				</Box>
			)}
		</Box>
	);
};

export default PhotoBoard;
