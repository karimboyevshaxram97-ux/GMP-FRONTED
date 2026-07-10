import Swal from 'sweetalert2';
import { translateStatic as tr } from './utils/translations';

// Sayt uslubiga moslangan Swal instansi — tugma inline stillari o'chirilgan
// (buttonsStyling: false), CSS to'liq nazorat qiladi (qarang: error-state.scss
// ichidagi .gmp-swal-* qoidalar).
const SwalThemed = Swal.mixin({
	buttonsStyling: false,
	customClass: {
		popup: 'gmp-swal-popup',
		confirmButton: 'gmp-swal-confirm',
		cancelButton: 'gmp-swal-cancel',
	},
});

export const sweetErrorAlert = (msg?: string) => {
	return SwalThemed.fire({
		icon: 'error',
		title: tr('common.errorTitle', 'Error'),
		text: msg ?? tr('errors.somethingWentWrong', 'Something went wrong!'),
		confirmButtonText: tr('common.ok', 'OK'),
	});
};

export const sweetMixinErrorAlert = async (msg?: string) => {
	await SwalThemed.fire({
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
	await SwalThemed.fire({
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
	const result = await SwalThemed.fire({
		title: msg ?? tr('common.areYouSure', 'Are you sure?'),
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: tr('common.yes', 'Yes'),
		cancelButtonText: tr('common.no', 'No'),
	});
	return result.isConfirmed;
};
