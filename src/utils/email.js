const nodemailer = require('nodemailer');
const { config: configData } = require('../core/config');
const { log } = require('../core/logger');

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: configData.email.host,
  port: configData.email.port,
  secure: configData.email.secure || false,
  auth: {
    user: configData.email.user,
    pass: configData.email.password
  }
});

/**
 * 邮件发送工具
 */
const emailUtil = {
  /**
   * 发送邮件
   * @param {Object} options - 邮件选项
   * @returns {Promise<Object>} 发送结果
   */
  async sendEmail(options) {
    try {
      const mailOptions = {
        from: configData.email.from,
        to: options.to,
        subject: options.subject,
        text: options.text || '',
        html: options.html || ''
      };

      const info = await transporter.sendMail(mailOptions);
      log.info(`Email sent to ${options.to}, message ID: ${info.messageId}`);
      return info;
    } catch (error) {
      log.error('Failed to send email', error);
      throw new Error('Failed to send email');
    }
  },

  /**
   * 发送验证码邮件
   * @param {string} to - 收件人邮箱
   * @param {string} code - 验证码
   * @param {string} type - 验证码类型 (register/reset_password)
   * @returns {Promise<Object>} 发送结果
   */
  async sendVerificationCode(to, code, type = 'register') {
    let subject, text, html;

    if (type === 'register') {
      subject = '您的注册验证码';
      text = `您好！您的注册验证码是：${code}，有效期为5分钟，请尽快使用。`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">注册验证码</h2>
          <p>您好！</p>
          <p>您正在进行账号注册，您的验证码是：</p>
          <div style="font-size: 24px; font-weight: bold; color: #1890ff; margin: 20px 0;">${code}</div>
          <p>验证码有效期为 <strong>5分钟</strong>，请尽快完成注册。</p>
          <p>如果您没有发起此操作，请忽略此邮件。</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">此邮件为系统自动发送，请勿回复。</p>
        </div>
      `;
    } else if (type === 'reset_password') {
      subject = '密码重置验证码';
      text = `您好！您的密码重置验证码是：${code}，有效期为5分钟，请尽快使用。`;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">密码重置验证码</h2>
          <p>您好！</p>
          <p>您正在进行密码重置，您的验证码是：</p>
          <div style="font-size: 24px; font-weight: bold; color: #1890ff; margin: 20px 0;">${code}</div>
          <p>验证码有效期为 <strong>5分钟</strong>，请尽快完成密码重置。</p>
          <p>如果您没有发起此操作，请立即修改您的账号密码并联系客服。</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">此邮件为系统自动发送，请勿回复。</p>
        </div>
      `;
    }

    return await this.sendEmail({
      to,
      subject,
      text,
      html
    });
  },

  /**
   * 发送欢迎邮件
   * @param {string} to - 收件人邮箱
   * @param {string} username - 用户名
   * @returns {Promise<Object>} 发送结果
   */
  async sendWelcomeEmail(to, username) {
    const subject = '欢迎加入我们的平台';
    const text = `亲爱的${username}，欢迎加入我们的平台！`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">欢迎加入</h2>
        <p>亲爱的${username}：</p>
        <p>非常高兴您加入我们的平台！</p>
        <p>您的账号已成功创建，现在您可以开始使用我们的服务了。</p>
        <p>如果您有任何问题，请随时联系我们的客服团队。</p>
        <p style="margin-top: 30px;">祝您使用愉快！</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">此邮件为系统自动发送，请勿回复。</p>
      </div>
    `;

    return await this.sendEmail({
      to,
      subject,
      text,
      html
    });
  }
};

/**
 * 验证码管理工具
 */
const verificationCodeUtil = {
  /**
   * 生成验证码
   * @param {number} length - 验证码长度
   * @returns {string} 验证码
   */
  generateVerificationCode(length = 6) {
    const chars = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  /**
   * 生成验证码键名
   * @param {string} email - 邮箱
   * @param {string} type - 验证码类型
   * @returns {string} 键名
   */
  generateVerificationKey(email, type) {
    return `verification:${type}:${email}`;
  },

  /**
   * 生成验证码发送次数键名
   * @param {string} email - 邮箱
   * @param {string} type - 验证码类型
   * @returns {string} 键名
   */
  generateSendCountKey(email, type) {
    const today = new Date().toISOString().split('T')[0];
    return `verification:${type}:${email}:count:${today}`;
  },

  /**
   * 生成上次发送时间键名
   * @param {string} email - 邮箱
   * @param {string} type - 验证码类型
   * @returns {string} 键名
   */
  generateLastSendTimeKey(email, type) {
    return `verification:${type}:${email}:lastSendTime`;
  }
};

module.exports = {
  emailUtil,
  verificationCodeUtil
};