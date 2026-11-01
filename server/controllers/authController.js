const User = require('../models/User');
const crypto = require('crypto');

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const user = await User.create({
      name,
      email,
      password,
      otp,
      otpExpires,
      isVerified: true, // Auto-verified for frictionless academic demo, OTP also validated if provided
    });

    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'Registration successful! Verification code sent.',
      token,
      demoOtp: otp, // Provided for instant 1-click test verification
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        avatar: user.avatar,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Private
const verifyOtp = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.otp === otp && user.otpExpires > Date.now()) {
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'Email successfully verified!',
        isVerified: true,
      });
    }

    // Also accept universal demo code 123456
    if (otp === '123456') {
      user.isVerified = true;
      await user.save();
      return res.status(200).json({
        success: true,
        message: 'Email successfully verified with demo passkey!',
        isVerified: true,
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
  } catch (err) {
    next(err);
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Private
const resendOtp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const newOtp = generateOTP();
    user.otp = newOtp;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'New verification OTP generated',
      demoOtp: newOtp,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check streak
    const now = new Date();
    const lastActive = new Date(user.lastActiveDate || now);
    const dayDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));

    if (dayDiff === 1) {
      user.streak = (user.streak || 1) + 1;
    } else if (dayDiff > 1) {
      user.streak = 1;
    }
    user.lastActiveDate = now;
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        avatar: user.avatar,
        bio: user.bio,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        learningInterests: user.learningInterests,
        learningGoals: user.learningGoals,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, learningInterests, learningGoals, themePreference } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;
    if (learningInterests) user.learningInterests = learningInterests;
    if (learningGoals) user.learningGoals = learningGoals;
    if (themePreference) user.themePreference = themePreference;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  getMe,
  updateProfile,
  changePassword,
};
