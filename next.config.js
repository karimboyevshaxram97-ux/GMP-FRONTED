/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	env: {
		REACT_APP_API_URL: process.env.REACT_APP_API_URL,
		REACT_APP_API_GRAPHQL_URL: process.env.REACT_APP_API_GRAPHQL_URL,
		REACT_APP_API_GRAPHQL_WS: process.env.REACT_APP_API_GRAPHQL_WS,
		REACT_APP_API_WS: process.env.REACT_APP_API_WS,
		REACT_APP_CHAT_WS: process.env.REACT_APP_CHAT_WS,
	},
	webpack: (config, { isServer }) => {
		if (isServer) {
			config.output.chunkFilename = 'chunks/[name].js';
		}
		return config;
	},
};

module.exports = nextConfig;
