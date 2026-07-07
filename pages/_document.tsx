import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html>
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/svg+xml" href="/img/logo/favicon.svg" />
				<meta name="keyword" content="gmp, global migration platform, visa, study abroad, work abroad" />
				<meta
					name="description"
					content="GMP — Global Migration Platform. Find trusted agencies for visa, study abroad, work abroad and travel services worldwide."
				/>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
			</Head>
			<body>
				{/* Dark rejim tanlovi sahifa chizilishidan OLDIN qo'llanadi (oq "chaqnash" bo'lmasligi uchun) */}
				<script
					dangerouslySetInnerHTML={{
						__html:
							"(function(){try{if(localStorage.getItem('gmp-theme')==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();",
					}}
				/>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
