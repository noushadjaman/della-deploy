const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// In-memory store for OTP codes (in production, use Redis or database)
const otpStore = new Map();

// Rate limiting for OTP requests
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many OTP requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Generate OTP code
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send OTP email
router.post('/send-otp', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Store OTP
    otpStore.set(email, { otp, expiresAt });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your DELLA Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B0000; margin: 0;">DELLA</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Email Verification</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for registering with DELLA! To complete your registration, please use the verification code below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #fff; border: 2px solid #8B0000; border-radius: 8px; padding: 20px; display: inline-block;">
                <h1 style="margin: 0; font-size: 48px; color: #8B0000; letter-spacing: 10px; font-weight: bold;">${otp}</h1>
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              <strong>Important:</strong> This code will expire in 10 minutes for security reasons.
            </p>
          </div>

          <div style="background: #e9ecef; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              If you didn't request this verification, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ 
      message: 'OTP sent successfully',
      email: email.replace(/(.{2}).*@/, '$1***@') // Partially mask email in response
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Check if OTP exists
    const storedOTP = otpStore.get(email);
    
    if (!storedOTP) {
      return res.status(400).json({ error: 'No OTP found for this email. Please request a new one.' });
    }

    // Check if OTP has expired
    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    if (storedOTP.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    // OTP is valid - mark as verified and remove from store
    otpStore.delete(email);

    res.json({ 
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP. Please try again.' });
  }
});

// Resend OTP
router.post('/resend-otp', otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if there's an existing OTP
    const existingOTP = otpStore.get(email);
    
    if (existingOTP && Date.now() < existingOTP.expiresAt) {
      return res.status(400).json({ 
        error: 'An OTP has already been sent. Please check your email or wait before requesting a new one.' 
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Store OTP
    otpStore.set(email, { otp, expiresAt });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your DELLA Email Verification Code (Resend)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #8B0000; margin: 0;">DELLA</h1>
            <p style="color: #666; margin: 10px 0 0 0;">Email Verification (Resend)</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-top: 0;">Your New Verification Code</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Here is your new verification code:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #fff; border: 2px solid #8B0000; border-radius: 8px; padding: 20px; display: inline-block;">
                <h1 style="margin: 0; font-size: 48px; color: #8B0000; letter-spacing: 10px; font-weight: bold;">${otp}</h1>
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              <strong>Important:</strong> This code will expire in 10 minutes for security reasons.
            </p>
          </div>

          <div style="background: #e9ecef; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              If you didn't request this verification, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ 
      message: 'New OTP sent successfully',
      email: email.replace(/(.{2}).*@/, '$1***@') // Partially mask email in response
    });

  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ error: 'Failed to resend OTP. Please try again.' });
  }
});

module.exports = router;