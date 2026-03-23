# Admin Panel

**Development Only** - This admin panel is blocked in production via middleware.

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
1. **Proxy** ([src/proxy.js](../../proxy.js)) - Blocks `/admin` page access in production
2. **API Protection** ([src/app/api/admin/save-photos/route.js](../api/admin/save-photos/route.js)) - Returns 403 for admin API calls in production

## Deployment

The admin code is committed to GitHub but **not accessible in production** thanks to multiple protection layers:

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

This means:
- ✅ Code is version controlled
- ✅ Available in development
- ✅ Page access blocked in production (redirects to homepage)
- ✅ API access blocked in production (returns 403)
- ✅ No security risk

## API Routes

- `POST /api/admin/save-photos` - Saves photo metadata to `public/data/photos.json` (dev only)

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
