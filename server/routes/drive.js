const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/drive/callback';

let oauth2Client = null;
try {
  oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
} catch (e) {
  console.error('Failed to create OAuth2 client:', e.message);
}

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

const getAuthenticatedClient = async (userId) => {
  if (!oauth2Client) return null;
  const user = await User.findById(userId);
  if (!user || !user.googleDriveRefreshToken) return null;
  oauth2Client.setCredentials({
    refresh_token: user.googleDriveRefreshToken,
    access_token: user.googleDriveAccessToken,
    expiry_date: user.googleDriveTokenExpiry ? user.googleDriveTokenExpiry.getTime() : null,
  });
  if (oauth2Client.isTokenExpiring()) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      user.googleDriveAccessToken = credentials.access_token;
      user.googleDriveTokenExpiry = credentials.expiry_date ? new Date(credentials.expiry_date) : null;
      if (credentials.refresh_token) user.googleDriveRefreshToken = credentials.refresh_token;
      await user.save();
      oauth2Client.setCredentials(credentials);
    } catch {
      return null;
    }
  }
  return oauth2Client;
};

router.get('/auth', adminAuth, (req, res) => {
  if (!oauth2Client) {
    return res.status(500).json({ error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env' });
  }
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state: req.user._id.toString(),
    redirect_uri: REDIRECT_URI,
  });
  res.json({ url });
});

router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) return res.status(400).send('Missing code or state');
    const { tokens } = await oauth2Client.getToken(code);
    await User.findByIdAndUpdate(state, {
      googleDriveAccessToken: tokens.access_token,
      googleDriveRefreshToken: tokens.refresh_token || '',
      googleDriveTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    });
    res.send(`<!DOCTYPE html><html><body><script>
      window.opener.postMessage({ type: 'drive-connected' }, '*');
      window.close();
    <\/script><p>Connected! You may close this window.</p></body></html>`);
  } catch (err) {
    console.error('Drive callback error:', err.message);
    res.status(500).send('Authentication failed');
  }
});

router.get('/status', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ connected: !!user?.googleDriveRefreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/files', adminAuth, async (req, res) => {
  try {
    const auth = await getAuthenticatedClient(req.user._id);
    if (!auth) return res.status(401).json({ error: 'Drive not connected' });
    const drive = google.drive({ version: 'v3', auth });
    const response = await drive.files.list({
      q: "mimeType contains 'video/' and trashed=false",
      fields: 'files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink)',
      orderBy: 'modifiedTime desc',
      pageSize: 50,
    });
    res.json({ files: response.data.files || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/token', adminAuth, async (req, res) => {
  const auth = await getAuthenticatedClient(req.user._id);
  if (!auth) return res.status(401).json({ error: 'Drive not connected' });
  const token = auth.credentials.access_token;
  res.json({ accessToken: token });
});

router.post('/disconnect', adminAuth, async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    googleDriveAccessToken: '',
    googleDriveRefreshToken: '',
    googleDriveTokenExpiry: null,
  });
  res.json({ success: true });
});

router.get('/video/:fileId', adminAuth, async (req, res) => {
  try {
    const auth = await getAuthenticatedClient(req.user._id);
    if (!auth) return res.status(401).json({ error: 'Drive not connected' });
    const drive = google.drive({ version: 'v3', auth });
    try {
      await drive.permissions.create({
        fileId: req.params.fileId,
        requestBody: { role: 'reader', type: 'anyone' },
      });
    } catch {}
    const meta = await drive.files.get({
      fileId: req.params.fileId,
      fields: 'id,name,mimeType,size,webContentLink,webViewLink,thumbnailLink',
    });
    const directUrl = meta.data.webContentLink || `https://drive.google.com/uc?export=download&confirm=t&id=${req.params.fileId}`;
    res.json({ ...meta.data, directUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/video/:fileId/stream', adminAuth, async (req, res) => {
  try {
    const auth = await getAuthenticatedClient(req.user._id);
    if (!auth) return res.status(401).json({ error: 'Drive not connected' });
    const drive = google.drive({ version: 'v3', auth });
    const meta = await drive.files.get({ fileId: req.params.fileId, fields: 'mimeType,size,name' });
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : meta.data.size - 1;
      const chunkSize = end - start + 1;
      const response = await drive.files.get(
        { fileId: req.params.fileId, alt: 'media' },
        { responseType: 'stream', headers: { Range: `bytes=${start}-${end}` } }
      );
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${meta.data.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': meta.data.mimeType,
      });
      response.data.pipe(res);
    } else {
      const response = await drive.files.get(
        { fileId: req.params.fileId, alt: 'media' },
        { responseType: 'stream' }
      );
      res.writeHead(200, {
        'Content-Length': meta.data.size,
        'Content-Type': meta.data.mimeType,
        'Accept-Ranges': 'bytes',
      });
      response.data.pipe(res);
    }
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

module.exports = router;
