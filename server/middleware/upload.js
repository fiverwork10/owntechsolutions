const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'owntechsolutions',
    resource_type: 'auto',
    public_id: (req, file) => Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 50),
  },
});

const fileFilter = (req, file, cb) => {
  const ext = file.originalname.toLowerCase().split('.').pop();
  const allowedMimes = {
    images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp', 'image/tiff', 'image/avif'],
    videos: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska', 'video/ogg', 'video/3gpp', 'video/x-flv'],
    documents: [
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    archives: ['application/zip', 'application/x-rar-compressed', 'application/gzip', 'application/x-7z-compressed', 'application/x-tar']
  };
  const allAllowed = Object.values(allowedMimes).flat();
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'tiff', 'tif', 'ico', 'avif', 'mp4', 'mov', 'avi', 'webm', 'mkv', 'ogg', '3gp', 'flv', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'zip', 'rar', 'gz', '7z', 'tar'];
  if (allAllowed.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 1024 }
});

module.exports = upload;
