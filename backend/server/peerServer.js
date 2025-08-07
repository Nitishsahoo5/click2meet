// ✅ FILE: peerServer.js
const { ExpressPeerServer } = require('peer');
const express = require('express');

function setupPeerServer(httpServer) {
  const app = express();

  const peerServer = ExpressPeerServer(httpServer, {
    debug: true,
    path: '/',
  });

  app.use('/peerjs', peerServer);
  return app;
}

module.exports = setupPeerServer;
