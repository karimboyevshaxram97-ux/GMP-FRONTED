import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { REACT_APP_API_URL } from '../../config';
import { avatarSrc } from '../../utils/avatar';

interface PhotoCommentNode {
	_id: string;
	parentComment?: string | null;
	text?: string;
	userName?: string;
	userAvatar?: string;
	likeCount?: number;
	meLiked?: { myFavorite?: boolean }[];
	attachments?: { url: string; type: string; name?: string }[];
	replies: PhotoCommentNode[];
}

interface PhotoCommentThreadProps {
	comments: any[];
	replyLabel: string;
	onLike: (comment: any) => void;
	onReply: (comment: any) => void;
	onImageClick: (src: string) => void;
}

const buildThread = (comments: any[]): PhotoCommentNode[] => {
	const nodes = new Map<string, PhotoCommentNode>();
	comments.forEach((comment) => nodes.set(comment._id, { ...comment, replies: [] }));

	const roots: PhotoCommentNode[] = [];
	nodes.forEach((node) => {
		const parent = node.parentComment ? nodes.get(String(node.parentComment)) : undefined;
		if (parent && parent._id !== node._id) parent.replies.push(node);
		else roots.push(node);
	});

	const sortRepliesOldestFirst = (items: PhotoCommentNode[]) => {
		items.forEach((item) => {
			item.replies.reverse();
			sortRepliesOldestFirst(item.replies);
		});
	};
	sortRepliesOldestFirst(roots);
	return roots;
};

const PhotoCommentThread = ({ comments, replyLabel, onLike, onReply, onImageClick }: PhotoCommentThreadProps) => {
	const router = useRouter();
	const roots = useMemo(() => buildThread(comments), [comments]);
	const fallbackReplyLabels: Record<string, string> = {
		uz: 'Javob berish',
		en: 'Reply',
		ru: 'Ответить',
		ko: '답글',
	};
	const visibleReplyLabel = replyLabel === 'service.reply'
		? fallbackReplyLabels[router.locale || 'uz'] || fallbackReplyLabels.uz
		: replyLabel;

	const renderComment = (comment: PhotoCommentNode, depth = 0, parentName?: string): React.ReactNode => {
		const liked = Boolean(comment.meLiked?.[0]?.myFavorite);
		return (
			<div className={`photo-comment-thread__branch${depth ? ' is-reply' : ''}`} key={comment._id}>
				<div
					className="photo-comment-thread__item"
					onClick={(event) => { event.stopPropagation(); onReply(comment); }}
				>
					<img className="photo-comment-thread__avatar" src={avatarSrc(comment.userAvatar)} alt="" />
					<div className="photo-comment-thread__body">
						<div className="photo-comment-thread__heading">
							<strong>{comment.userName || 'User'}</strong>
							{parentName && <span>↳ @{parentName}</span>}
						</div>
						{comment.text && <p>{comment.text}</p>}
						{comment.attachments?.length ? (
							<div className="photo-comment-thread__attachments">
								{comment.attachments.map((attachment, index) => {
									const src = `${REACT_APP_API_URL}${attachment.url}`;
									return attachment.type === 'video' ? (
										<video key={index} src={src} controls onClick={(event) => event.stopPropagation()} />
									) : (
										<img
											key={index}
											src={src}
											alt=""
											onClick={(event) => { event.stopPropagation(); onImageClick(src); }}
										/>
									);
								})}
							</div>
						) : null}
						<div className="photo-comment-thread__actions">
							<button
								type="button"
								className={liked ? 'liked' : ''}
								onClick={(event) => { event.stopPropagation(); onLike(comment); }}
							>
								{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
								{(comment.likeCount ?? 0) > 0 && <span>{comment.likeCount}</span>}
							</button>
							<button type="button" onClick={(event) => { event.stopPropagation(); onReply(comment); }}>
								{visibleReplyLabel}
							</button>
						</div>
					</div>
				</div>
				{comment.replies.length > 0 && (
					<div className="photo-comment-thread__replies">
						{comment.replies.map((reply) => renderComment(reply, depth + 1, comment.userName || 'User'))}
					</div>
				)}
			</div>
		);
	};

	return <div className="photo-comment-thread">{roots.map((comment) => renderComment(comment))}</div>;
};

export default PhotoCommentThread;
