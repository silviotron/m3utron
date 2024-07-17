/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '"static-cdn.jtvnw.net',
                port: '',
            },
        ],
    },
};

export default nextConfig;
