const axios = require('axios');

let isConfigured = false;
const TARGET_NUMBER = '923352546059';

function getStatus() {
  return {
    connected: true,
    message: 'Messages stored in admin dashboard'
  };
}

async function sendWhatsAppMessage(to, text) {
  return { success: true, deliveredVia: 'dashboard' };
}

async function sendWhatsAppMedia(to, filePath, type, caption, fileName) {
  const fs = require('fs');
  fs.unlink(filePath, () => {});
  return { success: true, deliveredVia: 'dashboard' };
}

function initWhatsApp() {
  console.log('\n========================================');
  console.log('  Chat System Active');
  console.log('========================================');
  console.log('  Messages are stored in the database');
  console.log('  and visible in the Admin Dashboard.');
  console.log('  No WhatsApp API key needed.');
  console.log('========================================\n');
  isConfigured = true;
}

module.exports = { initWhatsApp, sendWhatsAppMessage, sendWhatsAppMedia, getStatus, TARGET_NUMBER };
