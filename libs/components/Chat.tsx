import React, { useEffect, useRef, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { socketVar, userVar } from '../../apollo/store';
import { avatarSrc } from '../utils/avatar';
import { sweetErrorAlert } from '../sweetAlert';
import { useUiLang } from '../utils/translations';

interface MessagePayload {
	event: string;
	text: string;
	authUser: {
		_id: string;
		firstName: string;
		lastName: string;
		avatar?: string;
	} | null;
}

const Chat = () => {
	const ui = useUiLang();
	const socket = useReactiveVar(socketVar);
	const user = useReactiveVar(userVar);

	const [open, setOpen] = useState(false);
	const [messagesList, setMessagesList] = useState<MessagePayload[]>([]);
	const [onlineUsers, setOnlineUsers] = useState<number>(0);
	const [messageInput, setMessageInput] = useState('');

	const contentRef = useRef<HTMLDivElement>(null);

	// Scroll to bottom when messages change or frame opens
	useEffect(() => {
		if (open && contentRef.current) {
			contentRef.current.scrollTop = contentRef.current.scrollHeight;
		}
	}, [messagesList, open]);

	useEffect(() => {
		if (!socket) return;

		socket.onmessage = (event: MessageEvent) => {
			try {
				const data = JSON.parse(event.data);
				switch (data.event) {
					case 'info':
						setOnlineUsers(data.totalClients ?? 0);
						break;
					case 'getMessages':
						setMessagesList(data.list ?? data.messages ?? []);
						break;
					case 'message':
						setMessagesList((prev) => [...prev, data]);
						break;
					default:
						break;
				}
			} catch {}
		};

		return () => {
			socket.onmessage = null;
		};
	}, [socket]);

	const onClickHandler = () => {
		if (!messageInput.trim()) {
			sweetErrorAlert(ui('chat.pleaseEnterAMessage'));
			return;
		}
		if (!socket || socket.readyState !== WebSocket.OPEN) {
			sweetErrorAlert(ui('chat.chatIsNotConnected'));
			return;
		}
		socket.send(JSON.stringify({ event: 'message', data: messageInput.trim() }));
		setMessageInput('');
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') onClickHandler();
	};

	const getAvatar = (authUser: MessagePayload['authUser']) => {
		if (!authUser?.avatar) return '';
		return avatarSrc(authUser.avatar);
	};

	const getInitials = (authUser: MessagePayload['authUser']) => {
		if (!authUser) return '?';
		return `${authUser.firstName?.[0] ?? ''}${authUser.lastName?.[0] ?? ''}`.toUpperCase();
	};

	return (
		<div className="chatting">
			{/* Floating toggle button */}
			<button className="chat-button" onClick={() => setOpen((v) => !v)}>
				{open ? (
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				) : (
					<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
					</svg>
				)}
			</button>

			{/* Chat frame */}
			<div className={`chat-frame${open ? ' open' : ''}`}>
				{/* Top */}
				<div className="chat-top">
					<span>{ui('chat.liveChat')}</span>
					<span className="chat-online-count">{onlineUsers} {ui('chat.online')}</span>
				</div>

				{/* Content */}
				<div className="chat-content" ref={contentRef}>
					<div className="chat-main">
						{messagesList.length === 0 && (
							<p className="chat-empty-text">{ui('chat.noMessagesYetSayHi')} 👋</p>
						)}
						{messagesList.map((msg, idx) => {
							const mine = !!user?._id && msg.authUser?._id === user._id;
							const avatarUrl = getAvatar(msg.authUser);
							const initials = getInitials(msg.authUser);
							const name = msg.authUser
								? `${msg.authUser.firstName} ${msg.authUser.lastName}`
								: ui('chat.guest');

							return (
								<div key={idx} className={mine ? 'msg-right-wrap' : 'msg-left-wrap'}>
									{!mine && (
										<div className="chat-avatar-small">
											{avatarUrl ? (
												<img src={avatarUrl} alt={name} />
											) : (
												<span>{initials}</span>
											)}
										</div>
									)}
									<div className={mine ? 'msg-right' : 'msg-left'}>
										{!mine && <span className="chat-msg-name">{name}</span>}
										<span className="chat-msg-text">{msg.text}</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Bottom */}
				<div className="chat-bott">
					<input
						className="msg-input"
						type="text"
						placeholder={user?._id ? ui('mypage.typeAMessage') : ui('chat.logInToChat')}
						value={messageInput}
						onChange={(e) => setMessageInput(e.target.value)}
						onKeyDown={handleKeyDown}
						disabled={!user?._id || !socket || socket.readyState !== WebSocket.OPEN}
					/>
					<button
						className="send-msg-btn"
						onClick={onClickHandler}
						disabled={!user?._id || !socket || socket.readyState !== WebSocket.OPEN}
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
							<line x1="22" y1="2" x2="11" y2="13" />
							<polygon points="22 2 15 22 11 13 2 9 22 2" />
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
};

export default Chat;
