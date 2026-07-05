import Swal from 'sweetalert2';
import { i18n } from 'next-i18next';

// Non-hook module: translate through the global i18next instance at call time,
// falling back to English before i18n has initialized (SSR/early client).
const tr = (key: string, fallback: string): string => {
	const value = i18n?.t(key, { ns: 'common' });
	return value && value !== key ? value : fallback;
};

export const sweetErrorAlert = (msg?: string) => {
	return Swal.fire({
		icon: 'error',
		title: tr('common.errorTitle', 'Error'),
		text: msg ?? tr('errors.somethingWentWrong', 'Something went wrong!'),
		confirmButtonColor: '#1649ff',
	});
};

export const sweetMixinErrorAlert = async (msg?: string) => {
	await Swal.fire({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 3000,
		timerProgressBar: true,
		icon: 'error',
		title: msg ?? tr('errors.somethingWentWrong', 'Something went wrong!'),
	});
};

export const sweetMixinSuccessAlert = async (msg?: string) => {
	await Swal.fire({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 3000,
		timerProgressBar: true,
		icon: 'success',
		title: msg ?? tr('common.success', 'Success!'),
	});
};

export const sweetConfirmAlert = async (msg?: string): Promise<boolean> => {
	const result = await Swal.fire({
		title: msg ?? tr('common.areYouSure', 'Are you sure?'),
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#1649ff',
		cancelButtonColor: '#d33',
		confirmButtonText: tr('common.yes', 'Yes'),
		cancelButtonText: tr('common.no', 'No'),
	});
	return result.isConfirmed;
};
