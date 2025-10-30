const fs = require('fs');
const path = require('path');
const { log } = require('../core/logger');

/**
 * 创建目录
 * @param {string} dirPath - 目录路径
 * @returns {Promise<void>}
 */
const createDir = async function(dirPath) {
  try {
    // 转换为绝对路径
    const absolutePath = path.isAbsolute(dirPath) ? dirPath : path.resolve(process.cwd(), dirPath);
    
    // 检查目录是否存在
    if (!fs.existsSync(absolutePath)) {
      // 创建目录（包括父目录）
      fs.mkdirSync(absolutePath, { recursive: true });
      log.info(`Directory created: ${absolutePath}`);
    }
  } catch (error) {
    log.error(`Failed to create directory ${dirPath}:`, error);
    throw error;
  }
}

/**
 * 检查文件是否存在
 * @param {string} filePath - 文件路径
 * @returns {boolean}
 */
const fileExists = function(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    log.error(`Failed to check file existence: ${filePath}`, error);
    return false;
  }
}

/**
 * 删除文件
 * @param {string} filePath - 文件路径
 * @returns {Promise<void>}
 */
const deleteFile = async function(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      log.info(`File deleted: ${filePath}`);
    }
  } catch (error) {
    log.error(`Failed to delete file ${filePath}:`, error);
    throw error;
  }
}

/**
 * 获取文件信息
 * @param {string} filePath - 文件路径
 * @returns {Promise<fs.Stats>}
 */
const getFileInfo = async function(filePath) {
  try {
    return fs.statSync(filePath);
  } catch (error) {
    log.error(`Failed to get file info ${filePath}:`, error);
    throw error;
  }
}

/**
 * 生成唯一文件名
 * @param {string} originalName - 原始文件名
 * @returns {string}
 */
const generateUniqueFileName = function(originalName) {
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
const getFileExtension = function(fileName) {
  return path.extname(fileName).toLowerCase();
}

/**
 * 验证文件类型
 * @param {string} fileName - 文件名
 * @param {string[]} allowedTypes - 允许的文件类型列表
 * @returns {boolean}
 */
const validateFileType = function(fileName, allowedTypes) {
  const ext = getFileExtension(fileName);
  return allowedTypes.includes(ext);
}

/**
 * 获取目录下的文件列表
 * @param {string} dirPath - 目录路径
 * @returns {string[]}
 */
const getFilesInDirectory = function(dirPath) {
  try {
    return fs.readdirSync(dirPath).filter(file => 
      fs.statSync(path.join(dirPath, file)).isFile()
    );
  } catch (error) {
    log.error(`Failed to read directory ${dirPath}:`, error);
    return [];
  }
};

module.exports = {
  createDir,
  fileExists,
  deleteFile,
  getFileInfo,
  generateUniqueFileName,
  getFileExtension,
  validateFileType,
  getFilesInDirectory
};