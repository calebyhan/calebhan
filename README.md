# Portfolio

Personal portfolio website showcasing coding projects and photography. Features semantic search for projects, an interactive photo gallery with location-based filtering, and a custom admin interface.

## Tech Stack

- **Framework** - Next.js 16 (App Router)
- **Styling** - Tailwind CSS
- **Search** - Custom BM25 implementation for semantic project search
- **Data** - JSON-based storage with pre-computed embeddings

## Getting Started

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

- `/src/app` - Next.js app router pages
  - `/code` - Projects page with search
  - `/photography` - Photo gallery
  - `/admin` - Admin panel for photo management
- `/src/components` - React components
- `/src/utils` - Search algorithms and utilities
- `/scripts` - Data processing scripts
- `/public/data` - JSON data files and embeddings

## Features

### Project Showcase
- Browse coding projects with detailed information
- Semantic search using BM25 ranking algorithm
- Filter by technologies and categories
- Modal view with project details and links

### Photography Gallery
- Interactive photo grid with lightbox
- Location-based filtering with visual map
- Photo metadata and captions
- Country-based organization

### Admin Panel
- Edit photo captions and descriptions
- Save changes directly to data files
- Preview photos before publishing
- Optional shared-secret auth for admin access

## Security Notes

- Production admin routes are disabled by default.
- Optional auth hardening:
  - `ADMIN_TOKEN=<long-random-secret>` enforces token auth for `/admin` and `/api/admin/*`.
  - Open `/admin?token=<ADMIN_TOKEN>` once to establish an HttpOnly admin cookie.
- Optional production admin override (not recommended unless needed):
  - `ADMIN_ALLOW_PROD=true` plus a valid `ADMIN_TOKEN`.

## Scripts

Process and generate data:
- `node scripts/process-photos.js` - Process photo metadata and generate embeddings
- `node scripts/process-projects.js` - Generate project search embeddings
- `node scripts/regenerate-captions.js` - Regenerate photo captions
- `node scripts/view-descriptions.js` - View current photo descriptions

## Development

The site uses JSON files in `/public/data` for content management:
- `projects.json` - Project information and metadata
- `photos.json` - Photo metadata and locations
- `project-embeddings.json` - Pre-computed search embeddings
- `techStack.json` - Technology badges and information
