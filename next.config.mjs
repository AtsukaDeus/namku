/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    loader: 'custom',
    loaderFile: './src/utils/carga_imagen.js',
  }
};

export default nextConfig;
