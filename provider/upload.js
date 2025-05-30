
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadImage = async (file, filename) => {
    try {
        if (!file || !file.name) {
            throw new Error('No valid file provided');
        }
        const uploadDir = path.resolve(__dirname, '../Uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        const ext = path.extname(file.name) || '.jpg';
        const uniqueFilename = `${filename}_${Date.now()}${ext}`;
        const uploadPath = path.join(uploadDir, uniqueFilename);
        await file.mv(uploadPath);
        return uniqueFilename;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};
export default uploadImage;