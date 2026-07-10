import React from 'react';
import ErrorState from './ErrorState';
import { translateStatic as tr } from '../../utils/translations';

interface Props {
	children: React.ReactNode;
}

interface State {
	hasError: boolean;
}

// Sahifa render vaqtida kutilmagan JS xatosiga uchraganda butun ilova
// oq/bo'sh ekranga aylanib qolmasligi uchun — o'rniga chiroyli fallback UI
// ko'rsatiladi. Faqat class componentlar render xatolarini ushlay oladi.
class ErrorBoundary extends React.Component<Props, State> {
	state: State = { hasError: false };

	static getDerivedStateFromError(): State {
		return { hasError: true };
	}

	componentDidCatch(error: Error, info: React.ErrorInfo) {
		console.error('Unhandled UI error:', error, info.componentStack);
	}

	handleRetry = () => {
		this.setState({ hasError: false });
	};

	render() {
		if (this.state.hasError) {
			return (
				<ErrorState
					title={tr('errors.unexpectedErrorTitle', 'Something went wrong')}
					description={tr('errors.unexpectedErrorDesc', 'An unexpected error occurred. Try reloading the page.')}
					onRetry={this.handleRetry}
				/>
			);
		}
		return this.props.children;
	}
}

export default ErrorBoundary;
