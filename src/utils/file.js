import fs from 'fs';
import path from 'path';
import { logger } from '../core/logger.js';

/**
 * 创建目录
 * @param {string} dirPath - 目录路径
 * @returns {Promise<void>}
 */
export async function createDir(dirPath) {
  try {
    // 转换为绝对路径
    const absolutePath = path.isAbsolute(dirPath) ? dirPath : path.resolve(process.cwd(), dirPath);
    
    // 检查目录是否存在
    if (!fs.existsSync(absolutePath)) {
      // 创建目录（包括父目录）
      fs.mkdirSync(absolutePath, { recursive: true });
      logger.info(`Directory created: ${absolutePath}`);
    }
  } catch (error) {
    logger.error(`Failed to create directory ${dirPath}:`, error);
    throw error;
  }
}

/**
 * 检查文件是否存在
 * @param {string} filePath - 文件路径
 * @returns {boolean}
 */
export function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    logger.error(`Failed to check file existence: ${filePath}`, error);
    return false;
  }
}

/**
 * 删除文件
 * @param {string} filePath - 文件路径
 * @returns {Promise<void>}
 */
export async function deleteFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`File deleted: ${filePath}`);
    }
  } catch (error) {
    logger.error(`Failed to delete file ${filePath}:`, error);
    throw error;
  }
}

/**
 * 获取文件信息
 * @param {string} filePath - 文件路径
 * @returns {Promise<fs.Stats>}
 */
export async function getFileInfo(filePath) {
  try {
    return fs.statSync(filePath);
  } catch (error) {
    logger.error(`Failed to get file info ${filePath}:`, error);
    throw error;
  }
}

/**
 * 生成唯一文件名
 * @param {string} originalName - 原始文件名
 * @returns {string}
 */
export function generateUniqueFileName(originalName) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  
  return `${name}_${timestamp}_${random}${ext}`;
}

/**
 * 获取文件扩展名
 * @param {string} fileName - 文件名
 * @returns {string}
 */
export function getFileExtension(fileName) {
  return path.extname(fileName).toLowerCase();
}

/**
 * 验证文件类型
 * @param {string} fileName - 文件名
 * @param {string[]} allowedTypes - 允许的文件类型列表
 * @returns {boolean}
 */
export function validateFileType(fileName, allowedTypes) {
  const ext = getFileExtension(fileName);
  return allowedTypes.includes(ext);
}

/**
 * 获取目录下的文件列表
 * @param {string} dirPath - 目录路径
 * @returns {string[]}
 */
export function getFilesInDirectory(dirPath) {
  try {
    return fs.readdirSync(dirPath).filter(file => 
      fs.statSync(path.join(dirPath, file)).isFile()
    );
  } catch (error) {
    logger.error(`Failed to read directory ${dirPath}:`, error);
    return [];
  }
}