module.exports = {
  apps: [
    {
      name: "dehy",
      script: "node_modules/.bin/next",
      args: "dev -p 3000",
      cwd: "/home/user/webapp",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
        NEXT_TELEMETRY_DISABLED: "1",
      },
      watch: false,
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "512M",
    },
    {
      name: "dehy-warmup",
      script: "node",
      args: "warmup.js",
      cwd: "/home/user/webapp",
      autorestart: false,
      watch: false,
    },
  ],
};
