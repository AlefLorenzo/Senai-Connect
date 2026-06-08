const fs = require('fs');
const path = require('path');

const uploadController = {
  uploadFile: async (req, res) => {
    try {
      const { file, name, folder } = req.body;

      if (!file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      }

      // Base64 format: data:image/png;base64,...
      const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: 'Formato de arquivo inválido. Deve ser um Data URI em Base64.' });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      // Validation
      const allowedTypes = [
        'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp',
        'video/mp4', 'video/quicktime',
        'application/pdf'
      ];
      if (!allowedTypes.includes(mimeType)) {
        return res.status(400).json({ error: `Tipo de arquivo não permitido: ${mimeType}` });
      }

      // Max size: 15MB for videos, 5MB for other files
      const isVideo = mimeType.startsWith('video/');
      const maxSize = isVideo ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
      if (buffer.length > maxSize) {
        return res.status(400).json({ 
          error: `Tamanho máximo excedido. O limite é de ${isVideo ? '15MB' : '5MB'}.` 
        });
      }

      // Create uploads directory (with optional subfolder) if it doesn't exist
      const uploadsDir = path.join(__dirname, '..', 'uploads', folder || '');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate a unique safe filename
      const safeName = name ? name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'file';
      const fileExt = mimeType.split('/')[1] === 'quicktime' ? 'mov' : mimeType.split('/')[1];
      const finalExt = safeName.includes('.') ? safeName.split('.').pop() : fileExt;
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${finalExt}`;
      const filePath = path.join(uploadsDir, fileName);

      // Write file
      fs.writeFileSync(filePath, buffer);

      // Generate URL with folder path
      const urlPath = folder ? `uploads/${folder}/${fileName}` : `uploads/${fileName}`;
      const publicUrl = `http://localhost:5000/${urlPath}`;

      res.status(200).json({
        message: 'Upload realizado com sucesso!',
        url: publicUrl,
        name: fileName,
        type: mimeType
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ error: 'Erro interno no servidor ao processar upload.' });
    }
  }
};

module.exports = uploadController;
