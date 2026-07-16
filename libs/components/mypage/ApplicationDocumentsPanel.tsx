import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import WorkspacesOutlinedIcon from '@mui/icons-material/WorkspacesOutlined';
import { APPLICATION_DOCUMENTS, GET_AGENCY, GET_SERVICE } from '../../../apollo/user/query';
import {
	REQUEST_APPLICATION_DOCUMENT,
	REVIEW_APPLICATION_DOCUMENT,
} from '../../../apollo/user/mutation';
import { REACT_APP_API_URL } from '../../config';
import { getJwtToken, refreshAuthTokens } from '../../auth';
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { useUiLang } from '../../utils/translations';
import { useLang } from '../../utils/lang';

type Mode = 'user' | 'agency';

interface Props {
	applicationId: string;
	agencyId: string;
	serviceId: string;
	mode: Mode;
}

const documentKinds = [
	'PASSPORT',
	'ID_CARD',
	'PHOTO',
	'DIPLOMA',
	'TRANSCRIPT',
	'BANK_STATEMENT',
	'EMPLOYMENT',
	'VISA_FORM',
	'OTHER',
];

const statusIcons: Record<string, React.ReactNode> = {
	REQUESTED: <HourglassEmptyIcon />,
	UPLOADED: <DescriptionOutlinedIcon />,
	ACCEPTED: <CheckCircleOutlineIcon />,
	REJECTED: <ErrorOutlineIcon />,
};

const formatBytes = (size?: number) => {
	if (!size) return '';
	if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
	return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const ApplicationDocumentsPanel = ({ applicationId, agencyId, serviceId, mode }: Props) => {
	const ui = useUiLang();
	const tr = useLang();
	const [requestOpen, setRequestOpen] = useState(false);
	const [requestKind, setRequestKind] = useState('PASSPORT');
	const [requestLabel, setRequestLabel] = useState('');
	const [requestFile, setRequestFile] = useState<File | null>(null);
	const [rejecting, setRejecting] = useState<any>(null);
	const [rejectionReason, setRejectionReason] = useState('');
	const [busyId, setBusyId] = useState('');

	const { data, loading, refetch } = useQuery(APPLICATION_DOCUMENTS, {
		variables: { applicationId },
		fetchPolicy: 'cache-and-network',
	});
	const { data: agencyData } = useQuery(GET_AGENCY, {
		variables: { id: agencyId },
		skip: !agencyId,
		errorPolicy: 'all',
	});
	const { data: serviceData } = useQuery(GET_SERVICE, {
		variables: { id: serviceId },
		skip: !serviceId,
		errorPolicy: 'all',
	});
	const [requestDocument, { loading: requesting }] = useMutation(REQUEST_APPLICATION_DOCUMENT);
	const [reviewDocument, { loading: reviewing }] = useMutation(REVIEW_APPLICATION_DOCUMENT);
	const documents: any[] = data?.applicationDocuments ?? [];
	const agency = agencyData?.getAgency;
	const service = serviceData?.getService;
	const agencyName = agency?.name ? tr(agency.name) : ui('documents.loadingRecipient');
	const serviceName = service?.name ? tr(service.name) : ui('documents.loadingService');

	const progress = useMemo(() => {
		const required = documents.filter((document) => document.required);
		if (!required.length) return 0;
		return Math.round((required.filter((document) => document.status === 'ACCEPTED').length / required.length) * 100);
	}, [documents]);

	const authorizedFetch = async (url: string, init?: RequestInit) => {
		const execute = () => fetch(url, {
			...init,
			headers: { ...(init?.headers || {}), Authorization: `Bearer ${getJwtToken()}` },
		});
		let response = await execute();
		if (response.status === 401 && await refreshAuthTokens()) response = await execute();
		return response;
	};

	const isAllowedFile = (file: File) => {
		const extension = file.name.split('.').pop()?.toLowerCase();
		return (
			['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) ||
			['pdf', 'jpg', 'jpeg', 'png'].includes(extension || '')
		) && file.size <= 10 * 1024 * 1024;
	};

	const uploadFile = async (documentId: string, file: File) => {
		const body = new FormData();
		body.append('file', file);
		const response = await authorizedFetch(`${REACT_APP_API_URL}/application-documents/${documentId}/upload`, {
			method: 'POST',
			body,
		});
		if (!response.ok) {
			const payload = await response.json().catch(() => null);
			const message = Array.isArray(payload?.message) ? payload.message.join(', ') : payload?.message;
			throw new Error(message || ui('documents.uploadFailed'));
		}
	};

	const handleRequest = async () => {
		if ((mode === 'agency' && !requestLabel.trim()) || (mode === 'user' && !requestFile)) return;
		if (requestFile && !isAllowedFile(requestFile)) {
			await sweetMixinErrorAlert(ui('documents.invalidFile'));
			return;
		}
		try {
			const documentLabel = requestLabel.trim() || ui(`documents.kind.${requestKind}`);
			const result = await requestDocument({
				variables: { input: { applicationId, kind: requestKind, label: documentLabel, required: mode === 'agency' } },
			});
			const createdDocument = result.data?.requestApplicationDocument;
			if (mode === 'user' && requestFile && createdDocument?._id) {
				setBusyId(createdDocument._id);
				await uploadFile(createdDocument._id, requestFile);
			}
			setRequestOpen(false);
			setRequestLabel('');
			setRequestFile(null);
			await refetch();
			await sweetMixinSuccessAlert(ui(mode === 'agency' ? 'documents.requestCreated' : 'documents.uploaded'));
		} catch (error: any) {
			await sweetMixinErrorAlert(error?.message || ui('documents.requestFailed'));
		} finally {
			setBusyId('');
		}
	};

	const handleUpload = async (document: any, file?: File) => {
		if (!file) return;
		if (!isAllowedFile(file)) {
			await sweetMixinErrorAlert(ui('documents.invalidFile'));
			return;
		}
		setBusyId(document._id);
		try {
			await uploadFile(document._id, file);
			await refetch();
			await sweetMixinSuccessAlert(ui('documents.uploaded'));
		} catch (error: any) {
			await sweetMixinErrorAlert(error?.message || ui('documents.uploadFailed'));
		} finally {
			setBusyId('');
		}
	};

	const handleDownload = async (document: any) => {
		setBusyId(document._id);
		try {
			const response = await authorizedFetch(`${REACT_APP_API_URL}/application-documents/${document._id}/download`);
			if (!response.ok) throw new Error(ui('documents.downloadFailed'));
			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const anchor = window.document.createElement('a');
			anchor.href = url;
			anchor.download = document.originalName || 'document';
			anchor.click();
			URL.revokeObjectURL(url);
		} catch (error: any) {
			await sweetMixinErrorAlert(error?.message || ui('documents.downloadFailed'));
		} finally {
			setBusyId('');
		}
	};

	const setReviewStatus = async (documentId: string, status: 'ACCEPTED' | 'REJECTED', reason?: string) => {
		try {
			await reviewDocument({ variables: { input: { documentId, status, rejectionReason: reason } } });
			setRejecting(null);
			setRejectionReason('');
			await refetch();
			await sweetMixinSuccessAlert(ui(status === 'ACCEPTED' ? 'documents.accepted' : 'documents.rejected'));
		} catch (error: any) {
			await sweetMixinErrorAlert(error?.message || ui('documents.reviewFailed'));
		}
	};

	return (
		<Box className="application-documents">
			<Box className="application-documents__head">
				<div>
					<span><LockOutlinedIcon /> {ui('documents.privateWorkspace')}</span>
					<h3>{ui('documents.title')}</h3>
					<p>{ui(mode === 'agency' ? 'documents.agencyHint' : 'documents.userHint')}</p>
				</div>
				<Button startIcon={<AddIcon />} variant="contained" onClick={() => setRequestOpen(true)}>
					{ui(mode === 'agency' ? 'documents.requestDocument' : 'documents.addDocument')}
				</Button>
			</Box>

			<Box className="application-documents__route" aria-label={ui('documents.destinationDetails')}>
				<div className="document-route__recipient">
					<span className="document-route__mark">
						{agency?.logo
							? <img src={`${REACT_APP_API_URL}/uploads/${agency.logo}`} alt="" />
							: <BusinessOutlinedIcon />}
					</span>
					<div>
						<small>{ui(mode === 'agency' ? 'documents.receivingAgency' : 'documents.sentToAgency')}</small>
						<strong>{agencyName}</strong>
					</div>
				</div>
				<div className="document-route__item">
					<WorkspacesOutlinedIcon />
					<div>
						<small>{ui('documents.relatedService')}</small>
						<strong>{serviceName}</strong>
					</div>
				</div>
				<div className="document-route__item document-route__reference">
					<TagOutlinedIcon />
					<div>
						<small>{ui('documents.applicationNumber')}</small>
						<strong>#{applicationId.slice(-6).toUpperCase()}</strong>
					</div>
				</div>
			</Box>

			<Box className="application-documents__progress">
				<div><span style={{ width: `${progress}%` }} /></div>
				<strong>{progress}%</strong>
			</Box>

			{loading && !documents.length ? (
				<Box className="application-documents__empty">{ui('common.loading')}</Box>
			) : documents.length === 0 ? (
				<Box className="application-documents__empty">
					{ui(mode === 'agency' ? 'documents.empty' : 'documents.userEmpty')}
				</Box>
			) : (
				<Box className="application-documents__list">
					{documents.map((document) => (
						<Box className="document-row" data-status={document.status} key={document._id}>
							<span className="document-row__icon">{statusIcons[document.status]}</span>
							<div className="document-row__content">
								<strong>{document.label}</strong>
								<span>{ui(`documents.kind.${document.kind}`)} · {ui(`documents.status.${document.status}`)}</span>
								{document.originalName && <small>{document.originalName} {formatBytes(document.size) && `• ${formatBytes(document.size)}`}</small>}
								{document.rejectionReason && <small className="document-row__reason">{document.rejectionReason}</small>}
							</div>
							<Box className="document-row__actions">
								{document.originalName && (
									<Button size="small" startIcon={<CloudDownloadOutlinedIcon />} onClick={() => handleDownload(document)} disabled={busyId === document._id}>
										{ui('documents.download')}
									</Button>
								)}
								{mode === 'user' && document.status !== 'ACCEPTED' && (
									<Button component="label" size="small" variant="outlined" startIcon={<CloudUploadOutlinedIcon />} disabled={busyId === document._id}>
										{document.originalName ? ui('documents.replace') : ui('documents.upload')}
										<input hidden type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => handleUpload(document, event.target.files?.[0])} />
									</Button>
								)}
								{mode === 'agency' && document.status === 'UPLOADED' && (
									<>
										<Button size="small" color="success" onClick={() => setReviewStatus(document._id, 'ACCEPTED')} disabled={reviewing}>{ui('documents.accept')}</Button>
										<Button size="small" color="error" onClick={() => setRejecting(document)} disabled={reviewing}>{ui('documents.reject')}</Button>
									</>
								)}
							</Box>
						</Box>
					))}
				</Box>
			)}

			<Dialog open={requestOpen} onClose={() => setRequestOpen(false)} fullWidth maxWidth="sm">
				<DialogTitle>{ui(mode === 'agency' ? 'documents.requestDocument' : 'documents.addDocument')}</DialogTitle>
				<DialogContent className="document-dialog-content">
					<FormControl fullWidth>
						<InputLabel>{ui('documents.documentType')}</InputLabel>
						<Select value={requestKind} label={ui('documents.documentType')} onChange={(event) => setRequestKind(event.target.value)}>
							{documentKinds.map((kind) => <MenuItem value={kind} key={kind}>{ui(`documents.kind.${kind}`)}</MenuItem>)}
						</Select>
					</FormControl>
					<TextField fullWidth label={ui(mode === 'agency' ? 'documents.requestLabel' : 'documents.documentLabel')} value={requestLabel} onChange={(event) => setRequestLabel(event.target.value)} />
					{mode === 'user' && (
						<Button component="label" variant="outlined" startIcon={<CloudUploadOutlinedIcon />}>
							{requestFile ? requestFile.name : ui('documents.chooseFile')}
							<input
								hidden
								type="file"
								accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
								onChange={(event) => setRequestFile(event.target.files?.[0] || null)}
							/>
						</Button>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setRequestOpen(false)}>{ui('agency.cancel')}</Button>
					<Button variant="contained" onClick={handleRequest} disabled={requesting || (mode === 'agency' && !requestLabel.trim()) || (mode === 'user' && !requestFile)}>
						{ui(mode === 'agency' ? 'documents.createRequest' : 'documents.addDocument')}
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={Boolean(rejecting)} onClose={() => setRejecting(null)} fullWidth maxWidth="sm">
				<DialogTitle>{ui('documents.rejectDocument')}</DialogTitle>
				<DialogContent className="document-dialog-content">
					<TextField fullWidth multiline rows={3} label={ui('documents.rejectionReason')} value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} />
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setRejecting(null)}>{ui('agency.cancel')}</Button>
					<Button color="error" variant="contained" disabled={!rejectionReason.trim() || reviewing} onClick={() => setReviewStatus(rejecting._id, 'REJECTED', rejectionReason.trim())}>{ui('documents.reject')}</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default ApplicationDocumentsPanel;
