import nodemailer from 'nodemailer';
import { config } from '../core/config.js';
import { logger } from '../core/logger.js';

// 创建邮件传输器
let transporter = null;

/**
 * 初始化邮件传输器
 * @returns {Promise<nodemailer.Transporter>}
 */
export async function initEmailTransporter() {
  try {
    // 如果已经初始化，直接返回
    if (transporter) {
      return transporter;
    }
    
    // 创建传输器
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.username,
        pass: config.email.password
      },
      tls: {
        // 允许无效证书（开发环境）
        rejectUnauthorized: config.server.environment === 'production'
      }
    });
    
    // 验证连接
    await transporter.verify();
    logger.info('Email transporter initialized successfully');
    
    return transporter;
  } catch (error) {
    logger.error('Failed to initialize email transporter:', error);
    throw new Error('邮件服务初始化失败');
  }
}

/**
 * 发送邮件
 * @param {Object} options - 邮件选项
 * @returns {Promise<Object>}
 */
export async function sendEmail(options) {
  try {
    // 确保传输器已初始化
    if (!transporter) {
      await initEmailTransporter();
    }
    
    // 合并默认选项
    const mailOptions = {
      from: config.email.from,
      ...options
    };
    
    // 发送邮件
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    
    return info;
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw new Error('发送邮件失败');
  }
}

/**
 * 发送验证码邮件
 * @param {string} to - 收件人邮箱
 * @param {string} code - 验证码
 * @param {string} subject - 邮件主题
 * @returns {Promise<Object>}
 */
export async function sendVerificationEmail(to, code, subject = '您的验证码') {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${subject}</h2>
        <p style="font-size: 16px; color: #666;">您好，</p>
        <p style="font-size: 16px; color: #666;">您的验证码是：</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0;">
          <span style="font-size: 24px; font-weight: bold; color: #007bff;">${code}</span>
        </div>
        <p style="font-size: 16px; color: #666;">请在10分钟内使用此验证码，过期将失效。</p>
        <p style="font-size: 16px; color: #666;">如果您没有请求此验证码，请忽略此邮件。</p>
        <hr style="margin: 20px 0; border: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;">此邮件由系统自动发送，请勿回复。</p>
      </div>
    `;
    
    const textContent = `
      ${subject}
      
      您好，
      
      您的验证码是：${code}
      
      请在10分钟内使用此验证码，过期将失效。
      
      如果您没有请求此验证码，请忽略此邮件。
      
      此邮件由系统自动发送，请勿回复。
    `;
    
    return await sendEmail({
      to,
      subject,
      text: textContent,
      html: htmlContent
    });
  } catch (error) {
    logger.error('Failed to send verification email:', error);
    throw new Error('发送验证码邮件失败');
  }
}

/**
 * 发送密码重置邮件
 * @param {string} to - 收件人邮箱
 * @param {string} resetUrl - 重置链接
 * @returns {Promise<Object>}
 */
export async function sendPasswordResetEmail(to, resetUrl) {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">重置您的密码</h2>
        <p style="font-size: 16px; color: #666;">您好，</p>
        <p style="font-size: 16px; color: #666;">我们收到了您重置密码的请求，请点击以下链接重置您的密码：</p>
        <div style="margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 16px;">重置密码</a>
        </div>
        <p style="font-size: 16px; color: #666;">如果链接无法点击，请复制以下地址到浏览器中打开：</p>
        <p style="font-family: monospace; word-break: break-all; color: #007bff;">${resetUrl}</p>
        <p style="font-size: 16px; color: #666;">此链接将在1小时后失效。</p>
        <p style="font-size: 16px; color: #666;">如果您没有请求重置密码，请忽略此邮件。</p>
        <hr style="margin: 20px 0; border: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;">此邮件由系统自动发送，请勿回复。</p>
      </div>
    `;
    
    const textContent = `
      重置您的密码
      
      您好，
      
      我们收到了您重置密码的请求，请点击以下链接重置您的密码：
      ${resetUrl}
      
      此链接将在1小时后失效。
      
      如果您没有请求重置密码，请忽略此邮件。
      
      此邮件由系统自动发送，请勿回复。
    `;
    
    return await sendEmail({
      to,
      subject: '密码重置请求',
      text: textContent,
      html: htmlContent
    });
  } catch (error) {
    logger.error('Failed to send password reset email:', error);
    throw new Error('发送密码重置邮件失败');
  }
}

/**
 * 生成验证码
 * @param {number} length - 验证码长度
 * @returns {string} - 验证码
 */
export function generateVerificationCode(length = 6) {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
}