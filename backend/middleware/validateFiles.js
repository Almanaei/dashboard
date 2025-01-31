// Middleware to ensure files are properly processed
export const validateFiles = (req, res, next) => {
  console.log('=== Validating Files ===');
  if (!req.files || req.files.length === 0) {
    console.log('No files to validate');
    return next();
  }

  console.log('Validating files:', req.files.map(f => ({
    fieldname: f.fieldname,
    originalname: f.originalname,
    filename: f.filename,
    mimetype: f.mimetype
  })));

  const invalidFiles = req.files.filter(file => {
    const missingFields = [];
    if (!file.filename) missingFields.push('filename');
    if (!file.originalname) missingFields.push('originalname');
    if (!file.mimetype) missingFields.push('mimetype');
    if (!file.size) missingFields.push('size');
    
    if (missingFields.length > 0) {
      console.error(`File ${file.originalname || 'unknown'} missing fields:`, missingFields);
      return true;
    }
    return false;
  });

  if (invalidFiles.length > 0) {
    console.error('Invalid files detected:', invalidFiles.map(f => ({
      originalname: f.originalname || 'unknown',
      missingFields: ['filename', 'originalname', 'mimetype', 'size'].filter(field => !f[field])
    })));
    return next(new Error(`Invalid files detected: ${invalidFiles.map(f => f.originalname || 'unknown').join(', ')}`));
  }

  next();
}; 