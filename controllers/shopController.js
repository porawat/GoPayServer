
import crypto from 'crypto';
import QRCode from 'qrcode';
import db from '../db/index.js';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { shop, shop_config, customer } = db;

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

const generateQRCode = async (shopId) => {
  try {
    const qrCodeUrl = `https://your-app.com/join?shop_id=${shopId}`;
    const uploadDir = path.resolve(__dirname, '../Uploads/qr_codes');
    await fs.mkdir(uploadDir, { recursive: true });
    const fileName = `${shopId}.png`;
    const filePath = path.join(uploadDir, fileName);
    await QRCode.toFile(filePath, qrCodeUrl, {
      width: 300,
      margin: 1,
    });
    return `Uploads/qr_codes/${fileName}`;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
};

const getmyshop = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ code: 401, message: 'ต้องล็อกอินเพื่อดึงข้อมูลร้านค้า' });
  }
  try {
    const shops = await shop.findAll({
      where: { owner_id: userId, deleted_at: null },
      attributes: ['id', 'shop_name', 'slug_id', 'shop_tel', 'contact_name', 'email', 'avatar', 'cover'],
    });
    return res.status(200).json({
      code: 1000,
      datarow: shops,
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงข้อมูลร้านค้า:', error);
    return res.status(500).json({
      code: 500,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

const createshop = async (req, res) => {
  const { shopSlugId, shopName, tel, contact_person, email } = req.body;
  const userId = req.user?.id;
  if (!shopSlugId || !shopName || !userId) {
    return res.status(400).json({
      code: 400,
      message: 'กรุณาระบุ slug, shop name และต้องล็อกอิน',
    });
  }
  try {
    const shop_id = crypto.randomUUID();
    const now = new Date();
    const avatar = req.files?.avatar || null;
    const cover = req.files?.cover || null;
    let avatar_image = null;
    let cover_image = null;
    if (avatar) {
      avatar_image = await uploadImage(avatar, `${shop_id}_avatar`);
    }
    if (cover) {
      cover_image = await uploadImage(cover, `${shop_id}_cover`);
    }
    await shop.create({
      id: shop_id,
      slug_id: shopSlugId,
      owner_id: userId,
      shop_name: shopName,
      shop_tel: tel || null,
      contact_name: contact_person || null,
      email: email || null,
      avatar: avatar_image,
      cover: cover_image,
      is_active: 'ACTIVE',
      created_at: now,
      updated_at: now,
      deleted_at: null,
    });
    const qrCodePath = await generateQRCode(shop_id);
    await shop_config.create({
      id: crypto.randomUUID(),
      shop_id,
      address: null,
      latitude: null,
      longitude: null,
      open_time: null,
      close_time: null,
      is_active: 'ACTIVE',
      notification_email: 1,
      notification_sms: 0,
      language: 'TH',
      currency: 'THB',
      theme: 'light',
      qr_code: qrCodePath,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    });
    return res.status(200).json({
      code: 1000,
      message: 'เพิ่มร้านค้าเรียบร้อยแล้ว',
      shop_id,
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการสร้างร้านค้า:', error);
    return res.status(500).json({
      code: 500,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

const getShopById = async (req, res) => {

  const { shopId } = req.params;
  console.log('shopId:', shopId);
  try {
    const shopData = await shop.findOne({
      where: {
        id: shopId,

        deleted_at: null,
      },
      attributes: ['id', 'shop_name', 'slug_id', 'shop_tel', 'contact_name', 'email', 'avatar', 'cover'],
      include: [{
        model: shop_config,
        as: 'config',
        attributes: [
          'address', 'latitude', 'longitude', 'open_time', 'close_time', 'is_active',
          'notification_email', 'notification_sms', 'language', 'currency', 'theme', 'qr_code'
        ],
        where: { deleted_at: null },
        required: false,
      }],
    });
    if (!shopData) {
      return res.status(404).json({ code: 404, message: 'ไม่พบร้านค้าที่ระบุ' });
    }
    const responseData = {
      shop_name: shopData.shop_name,
      shop_tel: shopData.shop_tel,
      email: shopData.email,
      contact_name: shopData.contact_name,
      avatar: shopData.avatar,
      cover: shopData.cover,
      slug_id: shopData.slug_id,
      ...shopData.config?.dataValues,
    };
    return res.status(200).json({
      code: 1000,
      datarow: responseData,
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงข้อมูลร้านค้า:', error);
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

const updateShop = async (req, res) => {
  const { shopId } = req.params;
  const {
    shopSlugId, shopName, tel, contact_person, email,
    address, latitude, longitude, open_time, close_time, is_active,
    notification_email, notification_sms, language, currency, theme
  } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ code: 401, message: 'ต้องล็อกอินเพื่ออัปเดตข้อมูลร้านค้า' });
  }

  try {
    const shopData = await shop.findOne({
      where: {
        id: shopId,
        owner_id: userId,
        deleted_at: null,
      },
    });

    if (!shopData) {
      return res.status(404).json({ code: 404, message: 'ไม่พบร้านค้าที่ระบุหรือคุณไม่มีสิทธิ์' });
    }

    const shopConfigData = await shop_config.findOne({
      where: { shop_id: shopId, deleted_at: null },
    });
    if (!shopConfigData) {
      return res.status(404).json({ code: 404, message: 'ไม่พบการตั้งค่าร้านค้า' });
    }

    const avatar = req.files?.avatar || null;
    const cover = req.files?.cover || null;
    const uploadDir = path.resolve(__dirname, '../Uploads');
    let avatar_image = shopData.avatar;
    let cover_image = shopData.cover;

    if (avatar) {
      try {
        if (shopData.avatar) {
          await fs.unlink(path.join(uploadDir, shopData.avatar)).catch(err => console.warn('ไม่สามารถลบภาพ avatar เก่าได้:', err));
        }
        avatar_image = await uploadImage(avatar, `${shopId}_avatar`);
      } catch (err) {
        console.warn('ข้อผิดพลาดในการจัดการ avatar:', err);
      }
    }
    if (cover) {
      try {
        if (shopData.cover) {
          await fs.unlink(path.join(uploadDir, shopData.cover)).catch(err => console.warn('ไม่สามารถลบภาพ cover เก่าได้:', err));
        }
        cover_image = await uploadImage(cover, `${shopId}_cover`);
      } catch (err) {
        console.warn('ข้อผิดพลาดในการจัดการ cover:', err);
      }
    }

    await shop.update({
      slug_id: shopSlugId || shopData.slug_id,
      shop_name: shopName || shopData.shop_name,
      shop_tel: tel !== undefined ? tel : shopData.shop_tel,
      contact_name: contact_person !== undefined ? contact_person : shopData.contact_name,
      email: email !== undefined ? email : shopData.email,
      avatar: avatar_image,
      cover: cover_image,
      updated_at: new Date(),
    },
      {
        where: {
          id: shopId
        }
      }


    );

    await shop_config.update({
      address: address !== undefined ? address : shopConfigData.address,
      latitude: latitude !== undefined ? parseFloat(latitude) : shopConfigData.latitude,
      longitude: longitude !== undefined ? parseFloat(longitude) : shopConfigData.longitude,
      open_time: open_time !== undefined ? open_time : shopConfigData.open_time,
      close_time: close_time !== undefined ? close_time : shopConfigData.close_time,
      is_active: is_active || shopConfigData.is_active,
      notification_email: notification_email !== undefined ? parseInt(notification_email) : shopConfigData.notification_email,
      notification_sms: notification_sms !== undefined ? parseInt(notification_sms) : shopConfigData.notification_sms,
      language: language || shopConfigData.language,
      currency: currency || shopConfigData.currency,
      theme: theme || shopConfigData.theme,
      updated_at: new Date(),
    }, {
      where: {
        shop_id: shopId
      }
    }
    );

    return res.status(200).json({
      code: 1000,
      message: 'อัปเดตข้อมูลร้านค้าเรียบร้อยแล้ว',
      shop_id: shopId,
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการอัปเดตข้อมูลร้านค้า:', error);
    return res.status(500).json({
      code: 500,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

const createCustomer = async (req, res) => {
  const { shop_id, name, email, phone, address } = req.body;
  if (!shop_id || !name) {
    return res.status(400).json({
      code: 400,
      message: 'กรุณาระบุ shop_id และชื่อลูกค้า',
    });
  }
  try {
    const shopData = await shop.findOne({
      where: { id: shop_id, deleted_at: null },
    });
    if (!shopData) {
      return res.status(404).json({ code: 404, message: 'ไม่พบร้านค้าที่ระบุ' });
    }
    const customer_id = crypto.randomUUID();
    const now = new Date();
    await customer.create({
      id: customer_id,
      shop_id,
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      is_active: 'ACTIVE',
      created_at: now,
      updated_at: now,
      deleted_at: null,
    });
    return res.status(200).json({
      code: 1000,
      message: 'เพิ่มลูกค้าเรียบร้อยแล้ว',
      customer_id,
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการเพิ่มลูกค้า:', error);
    return res.status(500).json({
      code: 500,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

export { getmyshop, createshop, getShopById, updateShop, createCustomer, uploadImage };
