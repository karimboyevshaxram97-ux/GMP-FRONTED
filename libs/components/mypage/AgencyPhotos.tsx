import React, { useRef, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Box, Button, MenuItem, Select, CircularProgress } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { GET_PHOTOS } from '../../../apollo/user/query';
import { CREATE_PHOTO, DELETE_PHOTO } from '../../../apollo/user/mutation';
import { REACT_APP_API_URL, serviceTypeLabels } from '../../config';
import { getJwtToken } from '../../auth';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { useUiLang } from '../../utils/translations';

// My Agency: foto galereya boshqaruvi — surat yuklash, yo'nalish tanlash,
// o'chirish. Yuklangan suratlar Study/Work/Travel board'larida ko'rinadi.
const AgencyPhotos = ({ agencyId }: { agencyId: string }) => {
	const ui = useUiLang();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [serviceType, setServiceType] = useState('STUDY_ABROAD');
	const [uploading, setUploading] = useState(false);

	const { data, refetch } = useQuery(GET_PHOTOS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { agencyId, page: 1, limit: 50 } },
	});

	const [createPhoto] = useMutation(CREATE_PHOTO);
	const [deletePhoto] = useMutation(DELETE_PHOTO);

	const photos: any[] = data?.getPhotos?.list ?? [];

	const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		setUploading(true);
		try {
			const formData = new FormData();
			formData.append('file', file);
			const token = getJwtToken();
			const res = await fetch(`${REACT_APP_API_URL}/upload/image?type=image&board=${serviceType}`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: formData,
			});
			if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Upload failed');
			const { filename } = await res.json();

			await createPhoto({ variables: { input: { image: filename, serviceType } } });
			await refetch();
			await sweetMixinSuccessAlert(ui('mypage.photoAdded'));
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.graphQLErrors?.[0]?.message || err?.message || ui('errors.failedToUploadPhoto'));
		} finally {
			setUploading(false);
			if (fileInputRef.current) fileInputRef.current.value = '';
		}
	};

	const handleDelete = async (photoId: string) => {
		const confirmed = await sweetConfirmAlert(ui('mypage.deletePhotoConfirm'));
		if (!confirmed) return;
		try {
			await deletePhoto({ variables: { photoId } });
			await refetch();
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.graphQLErrors?.[0]?.message || err?.message);
		}
	};

	return (
		<Box className="agency-photos">
			<Box className="agency-photos__head">
				<div className="content-head" style={{ marginBottom: 0 }}>
					<span>{ui('mypage.photoGallery')}</span>
					<h2>{ui('service.photoBoard')}</h2>
				</div>

				<Box className="agency-photos__actions">
					<Select
						size="small"
						value={serviceType}
						onChange={(event) => setServiceType(event.target.value)}
					>
						{Object.entries(serviceTypeLabels).map(([value, label]) => (
							<MenuItem key={value} value={value}>{ui(label)}</MenuItem>
						))}
					</Select>

					<Button
						variant="contained"
						startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <AddPhotoAlternateIcon />}
						disabled={uploading}
						onClick={() => fileInputRef.current?.click()}
					>
						{ui('mypage.addPhoto')}
					</Button>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/jpeg,image/png,image/webp"
						hidden
						onChange={handleUpload}
					/>
				</Box>
			</Box>

			<p className="agency-photos__hint">{ui('mypage.photoBoardHint')}</p>

			{photos.length === 0 ? (
				<p className="agency-photos__empty">{ui('mypage.noPhotosYet')}</p>
			) : (
				<Box className="agency-photos__grid">
					{photos.map((photo) => (
						<Box key={photo._id} className="agency-photo">
							<img src={`${REACT_APP_API_URL}/uploads/${photo.image}`} alt="" loading="lazy" />
							<span className="agency-photo__type">{ui(serviceTypeLabels[photo.serviceType] || photo.serviceType)}</span>
							<button
								type="button"
								className="agency-photo__delete"
								onClick={() => handleDelete(photo._id)}
								aria-label={ui('mypage.deletePhoto')}
							>
								<DeleteOutlineIcon />
							</button>
							<Box className="agency-photo__stats">
								<span><FavoriteIcon /> {photo.likeCount ?? 0}</span>
								<span><VisibilityOutlinedIcon /> {photo.viewCount ?? 0}</span>
								<span><ChatBubbleOutlineIcon /> {photo.commentCount ?? 0}</span>
							</Box>
						</Box>
					))}
				</Box>
			)}
		</Box>
	);
};

export default AgencyPhotos;
