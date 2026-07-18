This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Article image uploads

Authenticated administrators can upload JPEG, PNG, and WebP article images through
`POST /api/uploads/images`. Images are decoded, auto-rotated, resized to a maximum
width of 1920 pixels without enlargement, stripped of metadata, and stored as WebP
under `public/uploads/articles/`.

The maximum input file size defaults to 5 MB. Configure it at runtime when needed:

```env
MAX_IMAGE_UPLOAD_MB="5"
```

The application checks `Content-Length` when present, bounds streamed multipart input
before parsing, and then validates the parsed `File.size`. The production Nginx
configuration should also enforce a slightly larger outer request limit, for example
`client_max_body_size 6m;` for the default 5 MB image limit.

### VPS persistence

`public/uploads/` contains runtime data and must persist across deployments. Deployment
scripts must not replace or delete this directory. A release-based deployment should
symlink it to a shared persistent directory. Container deployments must mount it as a
persistent volume. This local-storage design is not suitable for ephemeral serverless
instances.

Nginx may proxy `/uploads/` through the application's safe UUID image route or serve the
persistent upload directory directly. If Nginx serves it, disable directory listings and
deny dotfiles (including temporary upload names), while keeping the URL mapping rooted
at `/uploads/`.
