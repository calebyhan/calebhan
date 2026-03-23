# Admin Panel

By default, this admin panel is development-only and blocked in production.

## Access

- **Development**: http://localhost:3001/admin
- **Production**: Redirects to homepage (blocked by proxy)

## Features

- Edit photo metadata (camera, GPS, location, trip, tags)
- Interactive map for GPS coordinate selection
- Auto-geocoding from GPS coordinates (uses OpenStreetMap Nominatim)
- Bulk editing for multiple photos
- Filter photos by missing metadata

## Security

The `/admin` route and API endpoints are protected by:
1. **Proxy** ([src/proxy.js](../../proxy.js))
  - Blocks `/admin` and `/api/admin/*` by default in production
  - Optionally enforces token auth with `ADMIN_TOKEN`
2. **API Protection** ([src/app/api/admin/save-photos/route.js](../api/admin/save-photos/route.js))
  - Blocks production writes unless `ADMIN_ALLOW_PROD=true`
  - Validates auth token, origin, payload size, and schema
  - Uses atomic writes to avoid partial file corruption

### Optional Token Auth

Set an admin shared secret to require authentication for admin pages and API calls:

```bash
ADMIN_TOKEN=your-long-random-token
```

Then open:

```text
/admin?token=your-long-random-token
```

This sets a short-lived, HttpOnly `admin_token` cookie.

### Optional Production Admin Access

Production access is disabled by default. To explicitly enable it:

```bash
ADMIN_ALLOW_PROD=true
ADMIN_TOKEN=your-long-random-token
```

Without both variables, production admin access remains blocked.

## Deployment

The admin code is committed to GitHub and protected by multiple layers:

**Proxy Protection** (for page routes):
```javascript
if (process.env.NODE_ENV === 'production') {
  return NextResponse.redirect(new URL('/', request.url));
}
```

**API Protection** (for endpoints):
```javascript
if (process.env.NODE_ENV === "production") {
  return NextResponse.json(
    { error: "Admin endpoints are disabled in production" },
    { status: 403 }
  );
}
```

By default this means:
- ✅ Code is version controlled
- ✅ Available in development
- ✅ Page access blocked in production (redirects to homepage)
- ✅ API access blocked in production (returns 403)
- ✅ Optional token auth can be enabled for local and production admin access

## API Routes

- `POST /api/admin/save-photos` - Saves photo metadata to `public/data/photos.json`

## Photo Processing Workflow

When you add new photos, follow this checklist:

1. Place new images in `public/photos`.
  - The processing script reads from `public/photos` (not `public/img/photos`).
2. Optional: compress large files before processing.
  - Run `npm run compress-photos`
  - Requires ImageMagick (`brew install imagemagick`)
3. Process metadata, AI tags/captions, and embeddings.
  - Run `npm run process-photos`
4. Review and edit metadata in Admin.
  - Start dev server: `npm run dev`
  - Open `/admin` and save edits (writes to `public/data/photos.json` in development)

### Optional: Regenerate all AI captions

Use this if you want fresh captions for every photo:

1. Run `node scripts/regenerate-captions.js`
2. Run `npm run process-photos`
