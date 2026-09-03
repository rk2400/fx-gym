/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // pdfkit reads its built-in AFM font metrics from disk at runtime —
    // bundling it breaks those reads, so keep it external (native require).
    serverComponentsExternalPackages: ['pdfkit'],
    // Invoice PDFs embed custom fonts from public/fonts — make sure the
    // serverless bundle ships them alongside the route.
    outputFileTracingIncludes: {
      '/api/invoices/pdf': ['./public/fonts/**/*'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig