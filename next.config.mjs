/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Foto gejala sudah ukuran wajar & lokal; nonaktifkan optimizer agar
  // build sederhana dan foto tetap tampil di export/preview tanpa loader.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
