/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Ensures a static export

  async rewrites() {
    return [
      {
        source: '/getwaterdata',
        destination: 'https://water-watch-58265eebffd9.herokuapp.com/getwaterdata/',
      },
    ];
  },

  // Optional: Adjust the base path or asset prefix if deploying in a subdirectory
  assetPrefix: './', // Allows relative paths for assets in the static export
};

export default nextConfig;
