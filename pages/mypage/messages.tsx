import React, { useEffect, useRef, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
	Box, TextField, IconButton, CircularProgress, Badge, Tooltip, Chip,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';
import SearchIcon from '@mui/icons-material/Search';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import {
	MY_CONVERSATIONS,
	CONVERSATION_MESSAGES,
	GET_AGENCY,
} from '../../apollo/user/query';
import {
	SEND_MESSAGE,
	MARK_CONVERSATION_AS_READ,
	EDIT_MESSAGE,
	BLOCK_CONVERSATION,
} from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { getJwtToken } from '../../libs/auth';
import { UserRole } from '../../libs/enums/user.enum';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { REACT_APP_API_URL } from '../../libs/config';
import { useLang } from '../../libs/utils/lang';
import { sweetConfirmAlert } from '../../libs/sweetAlert';
import { useUiLang } from '../../libs/utils/translations';

function formatTime(dateStr: string) {
	const date = new Date(dateStr);
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const days = Math.floor(diff / 86400000);
	if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	if (days === 1) return 'Yesterday';
	if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
	return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function ConversationRow({
	conversation,
	isActive,
	onClick,
}: {
	conversation: any;
	isActive: boolean;
	onClick: () => void;
}) {
	const tr = useLang();
	const ui = useUiLang();
	const { data } = useQuery(GET_AGENCY, {
		errorPolicy: 'all',
		variables: { id: conversation.agency },
		skip: !conversation.agency,
	});
	const agency = data?.getAgency;
	const name = agency ? tr(agency.name) : ui('Agency');
	const logo = agency?.logo ? `${REACT_APP_API_URL}/uploads/${agency.logo}` : null;

	return (
		<Box
			className={`msg-conv-row${isActive ? ' active' : ''}${conversation.unreadCount > 0 ? ' unread' : ''}`}
			onClick={onClick}
		>
			<Box className="msg-conv-avatar">
				{logo ? (
					<img src={logo} alt={name} />
				) : (
					<BusinessIcon fontSize="small" />
				)}
			</Box>
			<Box className="msg-conv-info">
				<Box className="msg-conv-top">
					<strong className="msg-conv-name">{name}</strong>
					{conversation.lastMessageAt && (
						<time className="msg-conv-time">{formatTime(conversation.lastMessageAt)}</time>
					)}
				</Box>
				<Box className="msg-conv-bottom">
					<span className="msg-conv-preview">
						{conversation.lastMessage || ui('No messages yet')}
					</span>
					{conversation.unreadCount > 0 && (
						<Badge badgeContent={conversation.unreadCount} color="primary" className="msg-unread-badge" />
					)}
				</Box>
			</Box>
		</Box>
	);
}

const MessagesPage: NextPage = () => {
	const router = useRouter();
	const tr = useLang();
	const ui = useUiLang();
	const user = useReactiveVar(userVar);

	const [activeConv, setActiveConv] = useState<any>(null);
	const [search, setSearch] = useState('');
	const [messageText, setMessageText] = useState('');
	const [sending, setSending] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editText, setEditText] = useState('');
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!user?._id) {
			const jwt = getJwtToken();
			if (!jwt) router.push('/account/join');
		}
	}, [user, router]);

	const { data: convData, refetch: refetchConvs } = useQuery(MY_CONVERSATIONS, {
		pollInterval: 5000,
		fetchPolicy: 'network-only',
		skip: !user?._id,
	});

	const { data: msgData, loading: msgLoading, refetch: refetchMsgs } = useQuery(CONVERSATION_MESSAGES, {
		variables: { conversationId: activeConv?._id, limit: 50, skip: 0 },
		skip: !activeConv?._id,
		pollInterval: 3000,
		fetchPolicy: 'network-only',
	});

	const [sendMessage] = useMutation(SEND_MESSAGE);
	const [markAsRead] = useMutation(MARK_CONVERSATION_AS_READ);
	const [editMessage] = useMutation(EDIT_MESSAGE);
	const [blockConversation] = useMutation(BLOCK_CONVERSATION);

	const conversations: any[] = React.useMemo(() => convData?.myConversations ?? [], [convData?.myConversations]);
	const messages: any[] = React.useMemo(() => msgData?.conversationMessages ?? [], [msgData?.conversationMessages]);
	const { data: activeAgencyData } = useQuery(GET_AGENCY, {
		errorPolicy: 'all',
		variables: { id: activeConv?.agency },
		skip: !activeConv?.agency,
	});
	const activeAgencyName = activeAgencyData?.getAgency ? tr(activeAgencyData.getAgency.name) : ui('Agency');

	const filtered = conversations.filter((c) => {
		if (!search.trim()) return true;
		return (c.lastMessage ?? '').toLowerCase().includes(search.toLowerCase());
	});

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const openConversation = React.useCallback(async (conv: any) => {
		setActiveConv(conv);
		setEditingId(null);
		if (conv.unreadCount > 0) {
			await markAsRead({ variables: { conversationId: conv._id } });
			refetchConvs();
		}
		setTimeout(() => inputRef.current?.focus(), 100);
	}, [markAsRead, refetchConvs]);

	useEffect(() => {
		const id = router.query.id as string;
		if (id && conversations.length) {
			const found = conversations.find((c: any) => c._id === id);
			if (found && found._id !== activeConv?._id) openConversation(found);
		}
	}, [activeConv?._id, conversations, openConversation, router.query.id]);

	const handleSend = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!messageText.trim() || !activeConv || sending) return;
		setSending(true);
		try {
			await sendMessage({
				variables: { input: { conversationId: activeConv._id, text: messageText.trim() } },
			});
			setMessageText('');
			refetchMsgs();
			refetchConvs();
		} finally {
			setSending(false);
		}
	};

	const startEdit = (msg: any) => {
		setEditingId(msg._id);
		setEditText(msg.text);
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditText('');
	};

	const saveEdit = async (msgId: string) => {
		if (!editText.trim()) return;
		await editMessage({ variables: { input: { messageId: msgId, text: editText.trim() } } });
		setEditingId(null);
		refetchMsgs();
	};

	const handleBlock = async () => {
		if (!activeConv) return;
		const ok = await sweetConfirmAlert(ui("Block this conversation? You won't receive new messages."));
		if (!ok) return;
		await blockConversation({ variables: { conversationId: activeConv._id } });
		setActiveConv(null);
		refetchConvs();
	};

	const totalUnread = conversations.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);

	return (
		<div className="messages-page">
			<Box className="msg-layout">
				{/* ── Left sidebar ── */}
				<Box className="msg-sidebar">
					<Box className="msg-sidebar-header">
						<Box className="msg-sidebar-title">
							<ChatBubbleOutlineIcon />
							<span>{ui('Messages')}</span>
							{totalUnread > 0 && (
								<Chip label={totalUnread} color="primary" size="small" className="msg-total-badge" />
							)}
						</Box>
						<Box className="msg-search-wrap">
							<SearchIcon className="msg-search-icon" fontSize="small" />
							<input
								className="msg-search-input"
								placeholder={ui('Search conversations...')}
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</Box>
					</Box>

					<Box className="msg-conv-list">
						{filtered.length === 0 ? (
							<Box className="msg-empty-sidebar">
								<ChatBubbleOutlineIcon sx={{ fontSize: 40, color: '#c8d3f5' }} />
								<p>{search ? ui('No results found') : ui('No conversations yet')}</p>
								{!search && user?.role === UserRole.AGENCY_ADMIN && (
									<span>{ui('When users message your agency, conversations will appear here. Make sure your agency profile is set up and verified.')}</span>
								)}
								{!search && user?.role !== UserRole.AGENCY_ADMIN && (
									<>
										<span>{ui('Browse agencies and click Send message on their profile to start a conversation.')}</span>
										<button
											className="msg-start-btn"
											onClick={() => router.push('/agency')}
										>
											{ui('Browse agencies')}
										</button>
									</>
								)}
							</Box>
						) : (
							filtered.map((conv) => (
								<ConversationRow
									key={conv._id}
									conversation={conv}
									isActive={activeConv?._id === conv._id}
									onClick={() => openConversation(conv)}
								/>
							))
						)}
					</Box>
				</Box>

				{/* ── Right: chat window ── */}
				<Box className="msg-main">
					{!activeConv ? (
						<Box className="msg-empty-main">
							<ChatBubbleOutlineIcon sx={{ fontSize: 64, color: '#c8d3f5' }} />
							<h3>{ui('Select a conversation')}</h3>
							<p>{ui('Choose a conversation from the left to start messaging')}</p>
						</Box>
					) : (
						<>
							{/* Chat header */}
							<Box className="msg-chat-header">
								<IconButton
									size="small"
									className="msg-back-btn"
									onClick={() => setActiveConv(null)}
								>
									<ArrowBackIcon fontSize="small" />
								</IconButton>
								<ConvHeaderInfo conversation={activeConv} />
								<Box className="msg-header-actions">
									{activeConv.status !== 'BLOCKED' && (
										<Tooltip title={ui('Block conversation')}>
											<IconButton size="small" onClick={handleBlock} sx={{ color: '#94a3b8' }}>
												<BlockIcon fontSize="small" />
											</IconButton>
										</Tooltip>
									)}
								</Box>
							</Box>

							{/* Messages area */}
							<Box className="msg-chat-messages">
								{msgLoading && messages.length === 0 ? (
									<Box className="msg-chat-loading">
										<CircularProgress size={32} />
									</Box>
								) : messages.length === 0 ? (
									<Box className="msg-chat-empty">
										<ChatBubbleOutlineIcon sx={{ fontSize: 48, color: '#c8d3f5' }} />
										<p>{ui('No messages yet. Say hello!')}</p>
									</Box>
								) : (
									messages.map((msg: any) => {
										const isMine = msg.sender === user?._id;
										const isEditing = editingId === msg._id;
										const senderLabel = isMine
											? ui('You')
											: user?.role === UserRole.AGENCY_ADMIN
												? ui('User')
												: activeAgencyName;

										return (
											<Box key={msg._id} className={`msg-bubble-row${isMine ? ' mine' : ' theirs'}`}>
												<Box className={`msg-bubble${isMine ? ' bubble-mine' : ' bubble-theirs'}`}>
													<span className="msg-sender-label">{senderLabel}</span>
													{isEditing ? (
														<Box className="msg-edit-wrap">
															<input
																className="msg-edit-input"
																value={editText}
																onChange={(e) => setEditText(e.target.value)}
																onKeyDown={(e) => {
																	if (e.key === 'Enter') saveEdit(msg._id);
																	if (e.key === 'Escape') cancelEdit();
																}}
																autoFocus
															/>
															<Box className="msg-edit-actions">
																<IconButton size="small" onClick={() => saveEdit(msg._id)} sx={{ color: '#22c55e' }}>
																	<CheckIcon fontSize="small" />
																</IconButton>
																<IconButton size="small" onClick={cancelEdit} sx={{ color: '#ef4444' }}>
																	<CloseIcon fontSize="small" />
																</IconButton>
															</Box>
														</Box>
													) : (
														<>
															<p className="msg-text">{msg.text}</p>
															<Box className="msg-bubble-meta">
																<time className="msg-time">
																	{new Date(msg.createdAt).toLocaleTimeString([], {
																		hour: '2-digit',
																		minute: '2-digit',
																	})}
																</time>
																{msg.isEdited && (
																	<span className="msg-edited">{ui('edited')}</span>
																)}
															</Box>
														</>
													)}

													{isMine && !isEditing && (
														<Tooltip title={ui('Edit message')}>
															<IconButton
																size="small"
																className="msg-edit-btn"
																onClick={() => startEdit(msg)}
															>
																<EditIcon sx={{ fontSize: 13 }} />
															</IconButton>
														</Tooltip>
													)}
												</Box>
											</Box>
										);
									})
								)}
								<div ref={messagesEndRef} />
							</Box>

							{/* Input */}
							{activeConv.status === 'BLOCKED' ? (
								<Box className="msg-blocked-banner">
									<BlockIcon fontSize="small" />
									<span>{ui('This conversation is blocked')}</span>
								</Box>
							) : (
								<Box component="form" className="msg-chat-input" onSubmit={handleSend}>
									<TextField
										inputRef={inputRef}
										fullWidth
										size="small"
										multiline
										maxRows={4}
										placeholder={ui('Type a message... (Enter to send, Shift+Enter for new line)')}
										value={messageText}
										onChange={(e) => setMessageText(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === 'Enter' && !e.shiftKey) {
												e.preventDefault();
												handleSend(e as any);
											}
										}}
										className="msg-text-input"
									/>
									<IconButton
										type="submit"
										color="primary"
										disabled={!messageText.trim() || sending}
										className="msg-send-btn"
									>
										{sending ? (
											<CircularProgress size={20} sx={{ color: '#1649ff' }} />
										) : (
											<SendIcon />
										)}
									</IconButton>
								</Box>
							)}
						</>
					)}
				</Box>
			</Box>
		</div>
	);
};

function ConvHeaderInfo({ conversation }: { conversation: any }) {
	const tr = useLang();
	const ui = useUiLang();
	const { data } = useQuery(GET_AGENCY, {
		errorPolicy: 'all',
		variables: { id: conversation.agency },
		skip: !conversation.agency,
	});
	const agency = data?.getAgency;
	const name = agency ? tr(agency.name) : ui('Conversation');
	const logo = agency?.logo ? `${REACT_APP_API_URL}/uploads/${agency.logo}` : null;

	return (
		<Box className="msg-header-info">
			<Box className="msg-header-avatar">
				{logo ? (
					<img src={logo} alt={name} />
				) : (
					<BusinessIcon fontSize="small" />
				)}
			</Box>
			<Box>
				<strong className="msg-header-name">{name}</strong>
				{agency && (
					<span className="msg-header-sub">{agency.email}</span>
				)}
			</Box>
		</Box>
	);
}

export default withLayoutBasic(MessagesPage);

export { i18nStaticProps as getStaticProps } from '../../libs/i18n';
