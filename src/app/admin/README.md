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

The `/admin` route is protected by:
1. **Proxy** ([src/proxy.js](../../proxy.js)) - Blocks access in production

## Deployment

The admin code is committed to GitHub but **not accessible in production** thanks to the proxy check:

```javascript
if (process.env.NODE_ENV === 'production') {
  return NextResponse.redirect(new URL('/', request.url));
}
```

This means:
- ✅ Code is version controlled
- ✅ Available in development
- ✅ Blocked in production
- ✅ No security risk

## API Routes

- `POST /api/admin/save-photos` - Saves photo metadata to `public/data/photos.json`
