module.exports = {
  apps : [
      {
        name: "WebSocket",
        script: "ws.js",
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
      "user": "tguber",
      "ssh_options": "StrictHostKeyChecking=no",
      "key": "~/.ssh/id_rsa",
      "host": ["guberkray.myftp.org"],
      "ref": "origin/master",
      "repo": "git@github.com:GuBee33/legoTrain.git",
      "path": "/var/www/prod",
      "pre-deploy": "rm -rf /var/www/prod/source/*",
      "post-deploy": "cd /var/www/prod/source/frontend && npm install && npm run build && cd ../backend && npm install && cd /var/www/prod/source"
    }
  }
}	
