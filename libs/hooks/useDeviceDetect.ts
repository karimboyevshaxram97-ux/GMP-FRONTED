import { useEffect, useState } from 'react';

const useDeviceDetect = () => {
	const [device, setDevice] = useState<'mobile' | 'pc'>('pc');

	useEffect(() => {
		const checkDevice = () => {
			const width = window.innerWidth;
			setDevice(width <= 768 ? 'mobile' : 'pc');
		};

		checkDevice();
		window.addEventListener('resize', checkDevice);
		return () => window.removeEventListener('resize', checkDevice);
	}, []);

	return device;
};

export default useDeviceDetect;
