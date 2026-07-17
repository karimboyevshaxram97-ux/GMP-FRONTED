import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useLazyQuery, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SendIcon from '@mui/icons-material/Send';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import { GET_PHOTO_COMMENTS, GET_PHOTOS } from '../../../apollo/user/query';
import { CREATE_PHOTO_COMMENT, RECORD_VIEW, TOGGLE_LIKE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { ViewTargetType } from '../../enums/view.enum';
import { LikeTargetType } from '../../enums/like.enum';
import { useLang } from '../../utils/lang';
import { useUiLang } from '../../utils/translations';
import { getJwtToken } from '../../auth';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { getAnonymousViewerId } from '../../utils/viewer';
import PhotoCommentThread from '../common/PhotoCommentThread';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

const MAX_PER_AGENCY = 2;
const TOTAL_CARDS = 5;
const FETCH_POOL_SIZE = 20;
const MAX_COMMENT_IMAGES = 4;
const MAX_COMMENT_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_COMMENT_VIDEO_SIZE = 50 * 1024 * 1024;

interface StagedAttachment {
	file: File;
	previewUrl: string;
}

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
	const user = useReactiveVar(userVar);
	const [visible, setVisible] = useState(false);
	const [commentText, setCommentText] = useState('');
	const [stagedImages, setStagedImages] = useState<StagedAttachment[]>([]);
	const [stagedVideo, setStagedVideo] = useState<StagedAttachment | null>(null);
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const [attachmentSending, setAttachmentSending] = useState(false);
	const [attachmentLightbox, setAttachmentLightbox] = useState<string | null>(null);
	const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
	const [lightboxPhoto, setLightboxPhoto] = useState<{
		id: string;
		src: string;
		name: string;
		likeCount: number;
		viewCount: number;
		commentCount: number;
	} | null>(null);
	const gridRef = useRef<HTMLDivElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const videoInputRef = useRef<HTMLInputElement>(null);
	const commentInputRef = useRef<HTMLInputElement>(null);

	const { data, refetch } = useQuery(GET_PHOTOS, {
		fetchPolicy: 'cache-and-network',
		nextFetchPolicy: 'cache-first',
		variables: { input: { page: 1, limit: FETCH_POOL_SIZE } },
	});
	const [recordView] = useMutation(RECORD_VIEW);
	const [toggleLike] = useMutation(TOGGLE_LIKE);
	const [createComment, { loading: commentSending }] = useMutation(CREATE_PHOTO_COMMENT);
	const [loadComments, { data: commentsData, loading: commentsLoading, refetch: refetchComments }] = useLazyQuery(GET_PHOTO_COMMENTS, {
		fetchPolicy: 'cache-and-network',
	});

	const photos = pickDiversePhotos(data?.getPhotos?.list ?? []);
	const topRow = photos.slice(0, 2);
	const bottomRow = photos.slice(2, 5);
	const comments: any[] = commentsData?.getPhotoComments ?? [];
	const replyCopy = (key: 'service.replyingTo' | 'service.replyPlaceholder' | 'service.cancelReply', name = '') => {
		const translated = ui(key);
		if (translated !== key) return translated.replace('{{name}}', name);
		if (key === 'service.replyingTo') return `${name} ga javob yozyapsiz`;
		if (key === 'service.replyPlaceholder') return `${name} ga javob yozing...`;
		return 'Javob berishni bekor qilish';
	};

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

	const clearComposer = () => {
		stagedImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
		if (stagedVideo) URL.revokeObjectURL(stagedVideo.previewUrl);
		setCommentText('');
		setStagedImages([]);
		setStagedVideo(null);
		setShowEmojiPicker(false);
		setReplyingTo(null);
	};

	const closePhoto = () => {
		clearComposer();
		setAttachmentLightbox(null);
		setLightboxPhoto(null);
	};

	const openPhoto = (photo: any, src: string, name: string) => {
		clearComposer();
		setLightboxPhoto({
			id: photo._id,
			src,
			name,
			likeCount: photo.likeCount ?? 0,
			viewCount: photo.viewCount ?? 0,
			commentCount: photo.commentCount ?? 0,
		});
		loadComments({ variables: { photoId: photo._id } });

		recordView({
			variables: {
				targetId: photo._id,
				targetType: ViewTargetType.PHOTO,
				anonymousViewerId: user?._id ? undefined : getAnonymousViewerId(),
			},
		})
			.then(async () => {
				const result = await refetch();
				const updated = result?.data?.getPhotos?.list?.find((item: any) => item._id === photo._id);
				if (!updated) return;
				setLightboxPhoto((current) => {
					if (!current || current.id !== photo._id) return current;
					return {
						...current,
						likeCount: updated.likeCount ?? 0,
						viewCount: updated.viewCount ?? 0,
						commentCount: updated.commentCount ?? 0,
					};
				});
			})
			.catch(() => undefined);
	};

	const handleSelectImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);
		event.target.value = '';
		if (!files.length) return;
		if (files.some((file) => file.size > MAX_COMMENT_IMAGE_SIZE)) {
			await sweetMixinErrorAlert(ui('service.fileTooLarge'));
			return;
		}

		if (stagedVideo) {
			URL.revokeObjectURL(stagedVideo.previewUrl);
			setStagedVideo(null);
		}
		const nextItems = files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
		setStagedImages((current) => {
			const combined = [...current, ...nextItems];
			if (combined.length > MAX_COMMENT_IMAGES) {
				sweetMixinErrorAlert(ui('service.maxImagesReached'));
				combined.slice(MAX_COMMENT_IMAGES).forEach((item) => URL.revokeObjectURL(item.previewUrl));
			}
			return combined.slice(0, MAX_COMMENT_IMAGES);
		});
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
		setStagedImages((current) => {
			const target = current[index];
			if (target) URL.revokeObjectURL(target.previewUrl);
			return current.filter((_, itemIndex) => itemIndex !== index);
		});
	};

	const removeStagedVideo = () => {
		if (stagedVideo) URL.revokeObjectURL(stagedVideo.previewUrl);
		setStagedVideo(null);
	};

	const uploadCommentAttachment = async (file: File, kind: 'image' | 'video'): Promise<string> => {
		const formData = new FormData();
		formData.append('file', file);
		const endpoint = kind === 'video' ? 'upload/video' : 'upload/image?type=comment';
		const response = await fetch(`${REACT_APP_API_URL}/${endpoint}`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${getJwtToken()}` },
			body: formData,
		});
		if (!response.ok) {
			throw new Error((await response.json().catch(() => ({}))).message || 'Upload failed');
		}
		return (await response.json()).url as string;
	};

	const handleComment = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!user?._id) {
			router.push('/account/join');
			return;
		}
		if (!lightboxPhoto) return;
		const text = commentText.trim();
		if (!text && !stagedImages.length && !stagedVideo) return;

		setAttachmentSending(true);
		try {
			const attachments: { file: File; kind: 'image' | 'video' }[] = stagedVideo
				? [{ file: stagedVideo.file, kind: 'video' }]
				: stagedImages.map((item) => ({ file: item.file, kind: 'image' as const }));
			const attachmentUrls = await Promise.all(
				attachments.map(({ file, kind }) => uploadCommentAttachment(file, kind)),
			);

			await createComment({
				variables: {
					input: {
						photoId: lightboxPhoto.id,
						parentCommentId: replyingTo?.id || undefined,
						text: text || undefined,
						attachmentUrls: attachmentUrls.length ? attachmentUrls : undefined,
					},
				},
			});

			clearComposer();
			await refetchComments?.();
			const result = await refetch();
			const updated = result?.data?.getPhotos?.list?.find((item: any) => item._id === lightboxPhoto.id);
			setLightboxPhoto((current) => current && current.id === lightboxPhoto.id
				? { ...current, commentCount: updated?.commentCount ?? current.commentCount + 1 }
				: current);
		} catch (error: any) {
			await sweetMixinErrorAlert(error?.message || ui('errors.failedToSendComment'));
		} finally {
			setAttachmentSending(false);
		}
	};

	const renderCard = (photo: any) => {
		const name = tr(photo.agencyName) || ui('auth.agency');
		const src = `${REACT_APP_API_URL}/uploads/${photo.image}`;
		return (
			<div
				key={photo._id}
				className="top-liked-photo-card"
				onClick={() => openPhoto(photo, src, name)}
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
					<div className="top-liked-photo-card__stats">
						<span className="top-liked-photo-card__stat top-liked-photo-card__stat--likes" title={ui('agency.likes')}>
							<FavoriteIcon /> {photo.likeCount ?? 0}
						</span>
						<span className="top-liked-photo-card__stat" title={ui('agency.views')}>
							<VisibilityOutlinedIcon /> {photo.viewCount ?? 0}
						</span>
						<span className="top-liked-photo-card__stat" title={ui('agency.reviews')}>
							<ChatBubbleOutlineIcon /> {photo.commentCount ?? 0}
						</span>
					</div>
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
				<div className="photo-lightbox" onClick={closePhoto}>
					<button type="button" className="photo-lightbox__close" onClick={closePhoto} aria-label="Close">
						<CloseIcon />
					</button>
					<div className="photo-lightbox__content" onClick={(event) => event.stopPropagation()}>
						<div className="photo-lightbox__image">
							<img src={lightboxPhoto.src} alt={lightboxPhoto.name} />
						</div>
						<aside className="photo-lightbox__panel">
							<div className="photo-lightbox__meta">
								<strong>{lightboxPhoto.name}</strong>
								<div>
									<span><FavoriteIcon /> {lightboxPhoto.likeCount}</span>
									<span><VisibilityOutlinedIcon /> {lightboxPhoto.viewCount}</span>
									<span><ChatBubbleOutlineIcon /> {lightboxPhoto.commentCount}</span>
								</div>
							</div>
							<div className="photo-lightbox__comments">
								{commentsLoading ? (
									<p>{ui('common.loading')}</p>
								) : comments.length ? (
									<PhotoCommentThread
										comments={comments}
										replyLabel={ui('service.reply')}
										onLike={handleCommentLike}
										onReply={handleReply}
										onImageClick={setAttachmentLightbox}
									/>
								) : (
									<p>{ui('service.noCommentsYet')}</p>
								)}
							</div>

							<div className="photo-lightbox__composer">
								{replyingTo && (
									<div className="photo-lightbox__replying">
										<span>{replyCopy('service.replyingTo', replyingTo.name)}</span>
										<button type="button" onClick={() => setReplyingTo(null)} aria-label={replyCopy('service.cancelReply')}>
											<CloseIcon />
										</button>
									</div>
								)}
								{(stagedImages.length > 0 || stagedVideo) && (
									<div className="photo-lightbox__preview">
										{stagedImages.map((item, index) => (
											<div className="photo-lightbox__staged" key={item.previewUrl}>
												<img src={item.previewUrl} alt="" />
												<button type="button" onClick={() => removeStagedImage(index)} aria-label={ui('service.removeAttachment')}>
													<CloseIcon />
												</button>
											</div>
										))}
										{stagedVideo && (
											<div className="photo-lightbox__staged">
												<video src={stagedVideo.previewUrl} />
												<button type="button" onClick={removeStagedVideo} aria-label={ui('service.removeAttachment')}>
													<CloseIcon />
												</button>
											</div>
										)}
									</div>
								)}

								{showEmojiPicker && (
									<div className="photo-lightbox__emoji-picker">
										<EmojiPicker
											onEmojiClick={(emojiData) => setCommentText((current) => current + emojiData.emoji)}
											height={300}
											width="100%"
										/>
									</div>
								)}

								<form onSubmit={handleComment}>
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
									<button type="button" onClick={() => imageInputRef.current?.click()} disabled={!!stagedVideo} aria-label={ui('service.addImage')}>
										<ImageOutlinedIcon />
									</button>
									<button type="button" onClick={() => videoInputRef.current?.click()} disabled={stagedImages.length > 0} aria-label={ui('service.addVideo')}>
										<VideocamOutlinedIcon />
									</button>
									<button type="button" className={showEmojiPicker ? 'active' : ''} onClick={() => setShowEmojiPicker((current) => !current)} aria-label={ui('service.addEmoji')}>
										<EmojiEmotionsOutlinedIcon />
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
										className="photo-lightbox__send"
										disabled={commentSending || attachmentSending || (!commentText.trim() && !stagedImages.length && !stagedVideo)}
										aria-label="Send"
									>
										<SendIcon />
									</button>
								</form>
							</div>
						</aside>
					</div>
				</div>
			)}

			{attachmentLightbox && (
				<div className="photo-attachment-lightbox" onClick={() => setAttachmentLightbox(null)}>
					<button type="button" onClick={() => setAttachmentLightbox(null)} aria-label="Close"><CloseIcon /></button>
					<img src={attachmentLightbox} alt="" onClick={(event) => event.stopPropagation()} />
				</div>
			)}
		</section>
	);
};

export default TopLikedPhotos;
