import Swal from 'sweetalert2';

export const sweetErrorAlert = (msg: string = 'Something went wrong!') => {
	return Swal.fire({
		icon: 'error',
		title: 'Error',
		text: msg,
		confirmButtonColor: '#1649ff',
	});
};

export const sweetMixinErrorAlert = async (msg: string = 'Something went wrong!') => {
	await Swal.fire({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 3000,
		timerProgressBar: true,
		icon: 'error',
		title: msg,
	});
};

export const sweetMixinSuccessAlert = async (msg: string = 'Success!') => {
	await Swal.fire({
		toast: true,
		position: 'top-end',
		showConfirmButton: false,
		timer: 3000,
		timerProgressBar: true,
		icon: 'success',
		title: msg,
	});
};

export const sweetConfirmAlert = async (msg: string = 'Are you sure?'): Promise<boolean> => {
	const result = await Swal.fire({
		title: msg,
		icon: 'warning',
		showCancelButton: true,
		confirmButtonColor: '#1649ff',
		cancelButtonColor: '#d33',
		confirmButtonText: 'Yes',
		cancelButtonText: 'No',
	});
	return result.isConfirmed;
};
