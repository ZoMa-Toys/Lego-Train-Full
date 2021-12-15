module.exports = {
  apps : [
      {
        name: "WebSocket",
        script: "ws.js",
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
      "key": "/home/tguber/.ssh/id_rsa",
      "host": ["127.0.0.1"],
      "ref": "origin/master",
      "repo": "git@github.com:GuBee33/legoTrain.git",
      "path": "/var/www/prod",
      "pre-deploy": "rm -rf /var/www/prod/source/*",
      "post-deploy": "cd /var/www/prod/source/frontend && npm install && npm run build && cd ../backend && npm install"
    }
  }
}	
