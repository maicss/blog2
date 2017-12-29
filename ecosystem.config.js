module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : 'web',
      script    : 'server.js',
      watch     : ["backEnd", "server.js"],
      "restart_delay" : "4000"
    }
  ]
};