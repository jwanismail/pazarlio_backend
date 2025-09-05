const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Yetkilendirme başlığı bulunamadı' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token bulunamadı' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli-anahtar');
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Geçersiz token' });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Kullanıcı bulunamadı' });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware hatası:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Geçersiz token formatı' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token süresi dolmuş' });
    }
    res.status(401).json({ message: 'Lütfen tekrar giriş yapın' });
  }
};

module.exports = auth; 