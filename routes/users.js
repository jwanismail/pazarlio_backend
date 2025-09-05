const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Listing = require('../models/Listing');

// Kullanıcı kaydı
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor' });
    }

    // Telefon kontrolü (eğer telefon girilmişse)
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ message: 'Bu telefon numarası zaten kullanılıyor' });
      }
    }

    const user = new User({
      name,
      email,
      password,
      phone
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'gizli-anahtar',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Kullanıcı girişi (email ile)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Kullanıcı bulunamadı' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz şifre' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'gizli-anahtar',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Telefon ile giriş
router.post('/login-phone', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: 'Bu telefon numarasına kayıtlı hesap bulunamadı' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Geçersiz şifre' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'gizli-anahtar',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Kullanıcı bilgilerini getir
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Kullanıcının kendi ilanlarını getir
router.get('/me/listings', auth, async (req, res) => {
  try {
    const listings = await Listing.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Favori ilan ekle/çıkar (toggle)
router.post('/favorites/:listingId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const listingId = req.params.listingId;
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    const index = user.favorites.indexOf(listingId);
    if (index > -1) {
      user.favorites.splice(index, 1); // çıkar
    } else {
      user.favorites.push(listingId); // ekle
    }
    await user.save();
    res.json({ favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Favori ilanları getir
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 