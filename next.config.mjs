/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === "production";

const contentSecurityPolicy = [
	"default-src 'self'",
	"base-uri 'self'",
	"frame-ancestors 'none'",
	"object-src 'none'",
	"img-src 'self' data: blob: https:",
	"font-src 'self' https://fonts.gstatic.com",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
	"connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com",
	"upgrade-insecure-requests",
].join("; ");

const nextConfig = {
	poweredByHeader: false,
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "Content-Security-Policy",
						value: contentSecurityPolicy,
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
					{
						key: "Access-Control-Allow-Origin",
						value: isProduction ? "https://calebhan.top" : "http://localhost:3000",
					},
				],
			},
		];
	},
};

export default nextConfig;
