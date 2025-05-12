import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url"; // Add this for __dirname equivalent
import dbConfig from "../config/db.js";
import { config } from "dotenv";
import db from '../db/index.js';
config();

// Derive __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { shop } = db
const getmyshop = async (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ message: "ต้องระบุชื่อผู้ใช้" });
    }
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(
            "SELECT * FROM users WHERE username = ?",
            [username]
        );
        await connection.end();

        if (rows.length === 0) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }

        return res.status(200).json({
            status: "success",
            data: rows[0],
        });
    } catch (error) {
        console.error("ข้อผิดพลาด:", error);
        return res.status(500).json({
            status: "error",
            code: 5000,
            message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
        });
    }
};

const createshop = async (req, res) => {
    const { shopSlugId, shopName, tel, contact_person, email } = req.body;
    const user = req.user; // From JWT middleware
    const owner_id = user?.owner || null;

    if (!shopSlugId || !shopName || !owner_id) {
        return res.status(400).json({
            message: "กรุณาระบุ slug, shop name และ owner",
        });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const insertQuery = `
      INSERT INTO shop (
        shop_id, slug_id, owner_id, shop_name, tel, contact_name, email, avatar, cover, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
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

        await connection.execute(insertQuery, [
            shop_id,
            shopSlugId,
            owner_id,
            shopName,
            tel || null,
            contact_person || null,
            email || null,
            avatar_image,
            cover_image,
            "ACTIVE",
            now,
        ]);

        await connection.end();
        return res.status(200).json({
            status: "success",
            code: 1000,
            message: "เพิ่มร้านค้าเรียบร้อยแล้ว",
            shop_id,
        });
    } catch (error) {
        console.error("ข้อผิดพลาด:", error);
        return res.status(500).json({
            status: "error",
            code: 5000,
            message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
        });
    }
};
const createshop2 = async (req, res) => {
    const { shopSlugId, shopName, tel, contact_person, email } = req.body;
    const user = req.user; // From JWT middleware
    const owner_id = user?.owner || null;

    if (!shopSlugId || !shopName || !owner_id) {
        return res.status(400).json({
            message: "กรุณาระบุ slug, shop name และ owner",
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

        // Create shop using Sequelize
        await shop.create({
            id: shop_id,
            slug_id: shopSlugId,
            owner_id,
            shop_name: shopName,
            shop_tel: tel || null,
            contact_name: contact_person || null,
            email: email || null,
            avatar: avatar_image,
            cover: cover_image,
            is_active: "ACTIVE",
            created_at: now,
            updated_at: now,
            deleted_at: null
        });

        return res.status(200).json({
            status: "success",
            code: 1000,
            message: "เพิ่มร้านค้าเรียบร้อยแล้ว",
            shop_id,
        });
    } catch (error) {
        console.error("ข้อผิดพลาด:", error);
        return res.status(500).json({
            status: "error",
            code: 5000,
            message: "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
        });
    }
};

const uploadimage = async (file, filename) => {
    try {
        if (!file || !file.name) {
            throw new Error("No valid file provided");
        }

        // Use resolved path for Uploads directory
        const uploadDir = path.resolve(__dirname, "../Uploads");
        await fs.mkdir(uploadDir, { recursive: true });

        const ext = path.extname(file.name) || ".jpg";
        const uniqueFilename = `${filename}_${Date.now()}${ext}`;
        const uploadPath = path.join(uploadDir, uniqueFilename);

        await new Promise((resolve, reject) => {
            file.mv(uploadPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        return uniqueFilename;
    } catch (error) {
        console.error("Upload error:", error);
        throw error;
    }
};

export { getmyshop, createshop, createshop2 };