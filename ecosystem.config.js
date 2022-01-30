module.exports = {
  apps : [
      {
        name: "WebSocket",
        cwd: "/var/www/prod/source",
        script: "./backend/ws.js",
        time: true,
        instances: 1,
        autorestart: true,
        max_restarts: 50,
        watch: true,
        env: {
            API_PORT: 8080,
            NODE_ENV: "development"
        },
        env_production: {
            API_PORT: 80,
            NODE_ENV: "production",
        }
      }
  ],
  deploy: {
    production: {
      "user": process.env.USER,
      "ssh_options": "StrictHostKeyChecking=no",
      "key": "~/.ssh/id_rsa",
      "host": process.env.HOST,
      "ref": "origin/main",
      "repo": process.env.GITREPO,
      "path": "/var/www/prod",
      "post-deploy": "cd /var/www/prod/source/frontend && npm install && export VUE_APP_VERSION=" + process.env.VUE_APP_VERSION + " && npm run build && cd ../backend && npm install && cd /var/www/prod/source && sudo pm2 resurrect"
    }
  }
}