const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Whisky Cask Club" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to Whisky Cask Club!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #b8860b;">Welcome to Whisky Cask Club!</h1>
        <p>Dear ${name},</p>
        <p>Thank you for joining Whisky Cask Club. We're excited to have you on board!</p>
        <p>Start exploring our premium cask investment opportunities and build your whisky portfolio.</p>
        <p>Best regards,<br>The Whisky Cask Club Team</p>
      </div>
    `,
  }),

  passwordReset: (name, resetUrl) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #b8860b;">Password Reset Request</h1>
        <p>Dear ${name},</p>
        <p>You requested a password reset for your Whisky Cask Club account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #b8860b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Whisky Cask Club Team</p>
      </div>
    `,
  }),

  purchaseConfirmation: (name, purchaseDetails) => ({
    subject: 'Investment Interest Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #b8860b;">Investment Interest Received</h1>
        <p>Dear ${name},</p>
        <p>We've received your expression of interest for:</p>
        <div style="background-color: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3>${purchaseDetails.title}</h3>
          <p><strong>Investment Amount:</strong> $${purchaseDetails.amount}</p>
          <p><strong>Type:</strong> ${purchaseDetails.type}</p>
        </div>
        <p>Our investment team will review your application and contact you within 24 hours.</p>
        <p>Best regards,<br>The Whisky Cask Club Team</p>
      </div>
    `,
  }),

  referralReward: (name, amount, refereeName) => ({
    subject: 'Referral Reward Earned!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #b8860b;">Congratulations! You've Earned a Referral Reward</h1>
        <p>Dear ${name},</p>
        <p>Great news! You've earned a referral reward of <strong>$${amount}</strong> for referring ${refereeName} to Whisky Cask Club.</p>
        <p>The reward has been added to your account balance and is available for withdrawal.</p>
        <p>Keep referring friends and family to earn more rewards!</p>
        <p>Best regards,<br>The Whisky Cask Club Team</p>
      </div>
    `,
  }),

  payoutConfirmation: (name, amount, arrivalDate) => ({
    subject: 'Payout Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #b8860b;">Payout Confirmation</h1>
        <p>Dear ${name},</p>
        <p>Your payout request of <strong>$${amount}</strong> has been processed successfully.</p>
        <p>The funds will arrive in your account by ${arrivalDate}.</p>
        <p>You can track the status of your payout in your account dashboard.</p>
        <p>Best regards,<br>The Whisky Cask Club Team</p>
      </div>
    `,
  }),
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  const template = emailTemplates.welcome(name);
  return await sendEmail({
    email,
    ...template,
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const template = emailTemplates.passwordReset(name, resetUrl);
  return await sendEmail({
    email,
    ...template,
  });
};

// Send purchase confirmation email
const sendPurchaseConfirmationEmail = async (email, name, purchaseDetails) => {
  const template = emailTemplates.purchaseConfirmation(name, purchaseDetails);
  return await sendEmail({
    email,
    ...template,
  });
};

// Send referral reward email
const sendReferralRewardEmail = async (email, name, amount, refereeName) => {
  const template = emailTemplates.referralReward(name, amount, refereeName);
  return await sendEmail({
    email,
    ...template,
  });
};

// Send payout confirmation email
const sendPayoutConfirmationEmail = async (email, name, amount, arrivalDate) => {
  const template = emailTemplates.payoutConfirmation(name, amount, arrivalDate);
  return await sendEmail({
    email,
    ...template,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPurchaseConfirmationEmail,
  sendReferralRewardEmail,
  sendPayoutConfirmationEmail,
  emailTemplates,
};