/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/apps/jd-resume/:path*',
        destination: 'https://github.com/raktimneog08-ops/JD-RESUME/:path*',
      },
      {
        source: '/apps/shapeshifter/:path*',
        destination: 'https://resume-shapeshifter.onrender.com/:path*',
      },
      {
        source: '/apps/closer/:path*',
        destination: 'https://the-closer-m59fkvodcfreb8yjtdqkaw.streamlit.app/:path*',
      },
    ];
  },
};

export default nextConfig;
