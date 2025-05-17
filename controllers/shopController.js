//shopController.js
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { shop } = db;

const getmyshop = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ code: 401, message: 'ต้องล็อกอินเพื่อดึงข้อมูลร้านค้า' });
  }
  try {
    const shops = await shop.findAll({
      where: { owner_id: userId },
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
      avatar_image = await uploadimage(avatar, `${shop_id}_avatar`);
    }
    if (cover) {
      cover_image = await uploadimage(cover, `${shop_id}_cover`);
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
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ code: 401, message: 'ต้องล็อกอินเพื่อดึงข้อมูลร้านค้า' });
  }
  try {
    const shopData = await shop.findOne({
      where: {
        id: shopId,
        owner_id: userId,
      },
      attributes: ['id', 'shop_name', 'slug_id', 'shop_tel', 'contact_name', 'email', 'avatar', 'cover'],
    });
    if (!shopData) {
      return res.status(404).json({ code: 404, message: 'ไม่พบร้านค้าที่ระบุ' });
    }
    return res.status(200).json({
      code: 1000,
      datarow: shopData,
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงข้อมูลร้านค้า:', error);
    return res.status(500).json({
      code: 500,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

const updateShop = async (req, res) => {
  const { shopId } = req.params;

  console.log('shopId:', shopId);
  const { shopSlugId, shopName, tel, contact_person, email } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ code: 401, message: 'ต้องล็อกอินเพื่ออัปเดตข้อมูลร้านค้า' });
  }

  try {
    const shopData = await shop.findOne({
      where: {
        id: shopId,
        owner_id: userId,
      },
    });

    if (!shopData) {
      return res.status(404).json({ code: 404, message: 'ไม่พบร้านค้าที่ระบุหรือคุณไม่มีสิทธิ์' });
    }

    const avatar = req.files?.avatar || null;
    const cover = req.files?.cover || null;


    console.log('avatar:', avatar);
    console.log('cover:', cover);
    let avatar_image = shopData?.avatar || null;
    let cover_image = shopData?.cover || null;

    // ลบภาพเก่าถ้ามีการอัปโหลดภาพใหม่
    const uploadDir = path.resolve(__dirname, '../Uploads');
    if (avatar) {
      try {
        if (shopData?.avatar) {
          await fs.unlink(path.join(uploadDir, shopData.avatar));
        }
        avatar_image = await uploadimage(avatar, `${shopId}_avatar`);
      } catch (err) {
        console.warn('ไม่สามารถลบภาพ avatar เก่าได้:', err);
      }
    }
    if (cover) {
      try {
        if (shopData?.cover) {
          await fs.unlink(path.join(uploadDir, shopData?.cover));
        }
        cover_image = await uploadimage(cover, `${shopId}_cover`);
      } catch (err) {
        console.warn('ไม่สามารถลบภาพ cover เก่าได้:', err);
      }

    }
    console.log('avatar_image:', avatar_image);
    console.log('cover_image:', cover_image);
    await shopData.update({
      slug_id: shopSlugId || shopData?.slug_id,
      shop_name: shopName || shopData?.shop_name,
      shop_tel: tel || shopData?.shop_tel,
      contact_name: contact_person || shopData?.contact_name,
      email: email || shopData?.email,
      avatar: avatar_image,
      cover: cover_image,
      updated_at: new Date(),
    });

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

const uploadimage = async (file, filename) => {
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

export { getmyshop, createshop, getShopById, updateShop };