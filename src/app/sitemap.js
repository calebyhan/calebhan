const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://calebhan.top';

const routes = ['/', '/code', '/photography'];

export default function sitemap() {
  const lastModified = new Date().toISOString().split('T')[0];

  return routes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }));
}
