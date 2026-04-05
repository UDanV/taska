module.exports = {
  apps: [
    {
      name: "taska",
      script: "bun",
      args: "run start",
      cwd: "/var/www/taska",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "https://task-a.ru",
      },
    },
  ],
};
