/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/getwaterdata',
          destination: 'https://water-watch-58265eebffd9.herokuapp.com/getwaterdata/',
        },
      ];
    },
  };
  
  export default nextConfig;
  