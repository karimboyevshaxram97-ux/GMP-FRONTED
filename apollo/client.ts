import { useMemo } from 'react';
import { ApolloClient, ApolloLink, InMemoryCache, from, NormalizedCacheObject, HttpLink, Observable, split } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { getJwtToken, getRefreshToken } from '../libs/auth';
import { sweetErrorAlert } from '../libs/sweetAlert';
import { REACT_APP_API_GRAPHQL_URL, REACT_APP_API_GRAPHQL_WS } from '../libs/config';
import { isAuthErrorMessage, toFriendlyError } from '../libs/utils/errors';

let apolloClient: ApolloClient<NormalizedCacheObject>;

function getHeaders() {
	const headers: Record<string, string> = {};
	const token = getJwtToken();
	if (token) headers['Authorization'] = `Bearer ${token}`;
	return headers;
}

async function doTokenRefresh(): Promise<string | null> {
	const refreshToken = getRefreshToken();
	if (!refreshToken) return null;
	try {
		const res = await fetch(REACT_APP_API_GRAPHQL_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				query: `mutation RefreshToken($input: RefreshTokenInput!) { refreshToken(input: $input) { accessToken refreshToken } }`,
				variables: { input: { refreshToken } },
			}),
		});
		const json = await res.json();
		const data = json?.data?.refreshToken;
		if (data?.accessToken && data?.refreshToken) {
			localStorage.setItem('accessToken', data.accessToken);
			localStorage.setItem('refreshToken', data.refreshToken);
			return data.accessToken;
		}
	} catch {}
	return null;
}

function clearAuthAndRedirect() {
	localStorage.removeItem('accessToken');
	localStorage.removeItem('refreshToken');
	window.localStorage.setItem('logout', Date.now().toString());
	if (window.location.pathname !== '/account/join') {
		window.location.href = '/account/join';
	}
}

function createIsomorphicLink() {
	const httpLink = new HttpLink({
		uri: REACT_APP_API_GRAPHQL_URL,
		credentials: 'include',
	});

	if (typeof window === 'undefined') {
		return httpLink;
	}

	const authLink = new ApolloLink((operation, forward) => {
		operation.setContext(({ headers = {} }) => ({
			headers: {
				...headers,
				...getHeaders(),
			},
		}));
		return forward(operation);
	});

	const wsLink = new WebSocketLink({
		uri: REACT_APP_API_GRAPHQL_WS,
		options: {
			reconnect: false,
			timeout: 30000,
			lazy: true,
			connectionParams: () => ({
				headers: getHeaders(),
			}),
		},
	});

	const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
		const authErrorMessage = graphQLErrors?.find((e) => isAuthErrorMessage(e.message))?.message;
		const canTryRefresh = authErrorMessage && !/user is not active|banned|inactive/i.test(authErrorMessage);

		if (authErrorMessage) {
			return new Observable((observer) => {
				(canTryRefresh ? doTokenRefresh() : Promise.resolve(null))
					.then((newToken) => {
						if (!newToken) {
							clearAuthAndRedirect();
							observer.complete();
							return;
						}
						operation.setContext(({ headers = {} }: any) => ({
							headers: { ...headers, Authorization: `Bearer ${newToken}` },
						}));
						forward(operation).subscribe({
							next: observer.next.bind(observer),
							error: observer.error.bind(observer),
							complete: observer.complete.bind(observer),
						});
					})
					.catch((err) => {
						observer.error(err);
					});
			});
		}

		if (graphQLErrors) {
			graphQLErrors.forEach(({ message }) => {
				if (process.env.NODE_ENV !== 'production') console.log(`GraphQL error: ${message}`);
				if (!message.includes('input')) sweetErrorAlert(toFriendlyError(message));
			});
		}
		if (networkError && process.env.NODE_ENV !== 'production') console.log(`Network error: ${networkError}`);
	});

	const splitLink = split(
		({ query }) => {
			const definition = getMainDefinition(query);
			return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
		},
		wsLink,
		authLink.concat(httpLink),
	);

	return from([errorLink, splitLink]);
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(),
	});
}

export function initializeApollo(initialState = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;
	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}
