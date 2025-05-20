/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Desactivamos la optimización de imágenes para exportación estática
  images: {
    unoptimized: true,
  },
  // Aseguramos que no haya rutas dinámicas que no sean compatibles con exportación estática
  trailingSlash: true,
  // Ignoramos errores de TypeScript y ESLint durante la compilación
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
