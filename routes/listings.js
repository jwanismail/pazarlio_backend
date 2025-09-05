const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const auth = require('../middleware/auth');

// Vitrin ilanlarını getir (öne çıkan)
router.get('/featured', async (req, res) => {
  try {
    const now = new Date();
    const featuredListings = await Listing.find({ 
      status: 'active',
      featured: true,
      promotionType: 'vitrin',
      $or: [
        { featuredUntil: null },
        { featuredUntil: { $gte: now } }
      ]
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(12);
    
    res.json(featuredListings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Keşfet ilanlarını getir
router.get('/discover', async (req, res) => {
  try {
    const now = new Date();
    
    // Önce promosyon ilanlarını al (hem ücretli hem ücretsiz)
    const promotedListings = await Listing.find({ 
      status: 'active',
      featured: true,
      promotionType: { $in: ['kesfet', 'kesfet_free'] },
      $or: [
        { featuredUntil: null },
        { featuredUntil: { $gte: now } }
      ]
    })
      .populate('user', 'name email')
      .sort({ 
        promotionType: 1, // Önce ücretli promosyonlar (kesfet)
        createdAt: -1 
      });
    
    // Eğer yeterli promosyon ilanı yoksa, yeni normal ilanları da ekle
    if (promotedListings.length < 20) {
      const normalListings = await Listing.find({ 
        status: 'active',
        _id: { $nin: promotedListings.map(listing => listing._id) }
      })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(20 - promotedListings.length);
      
      const allListings = [...promotedListings, ...normalListings];
      res.json(allListings);
    } else {
      res.json(promotedListings.slice(0, 20));
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Spotlight ilanlarını getir
router.get('/spotlight', async (req, res) => {
  try {
    const now = new Date();
    const spotlightListings = await Listing.find({ 
      status: 'active',
      featured: true,
      promotionType: 'spotlight',
      $or: [
        { featuredUntil: null },
        { featuredUntil: { $gte: now } }
      ]
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json(spotlightListings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tüm ilanları getir
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find({ status: 'active' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tek bir ilanı getir
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('user', 'name email phone');
    if (!listing) {
      return res.status(404).json({ message: 'İlan bulunamadı' });
    }
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Promosyon satın al
router.post('/:id/promote', auth, async (req, res) => {
  try {
    const { promotionType, duration } = req.body; // duration gün cinsinden
    
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'İlan bulunamadı' });
    }

    if (listing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // Promosyon fiyatları (TL)
    const promotionPrices = {
      'vitrin': 25,
      'kesfet': 50,
      'spotlight': 100
    };

    if (!promotionPrices[promotionType]) {
      return res.status(400).json({ message: 'Geçersiz promosyon türü' });
    }

    // Promosyon süresini hesapla
    const now = new Date();
    const featuredUntil = new Date(now.getTime() + (duration || 7) * 24 * 60 * 60 * 1000);

    // İlanı güncelle
    listing.featured = true;
    listing.featuredUntil = featuredUntil;
    listing.promotionType = promotionType;

    await listing.save();

    res.json({
      message: 'Promosyon başarıyla satın alındı',
      listing,
      cost: promotionPrices[promotionType],
      duration: duration || 7
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni ilan oluştur
router.post('/', auth, async (req, res) => {
  try {
    // Gerekli alanların kontrolü
    const requiredFields = ['title', 'description', 'price', 'location', 'mainCategory', 'subCategory'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Eksik alanlar var', 
        fields: missingFields 
      });
    }

    // Yeni ilanları 24 saat boyunca keşfet bölümünde göstermek için (ücretsiz)
    const featuredUntil = new Date();
    featuredUntil.setHours(featuredUntil.getHours() + 24);

    const listing = new Listing({
      ...req.body,
      user: req.user._id,
      status: 'active',
      featured: true,
      promotionType: 'kesfet_free', // Ücretsiz promosyon olarak işaretle
      featuredUntil: featuredUntil
    });

    const newListing = await listing.save();
    
    // Populate user bilgilerini ekleyelim
    const populatedListing = await Listing.findById(newListing._id)
      .populate('user', 'name email');
      
    res.status(201).json(populatedListing);
  } catch (error) {
    console.error('İlan oluşturma hatası:', error);
    res.status(400).json({ 
      message: 'İlan oluşturulurken bir hata oluştu',
      error: error.message 
    });
  }
});

// İlan güncelle
router.patch('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'İlan bulunamadı' });
    }

    if (listing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    Object.assign(listing, req.body);
    const updatedListing = await listing.save();
    res.json(updatedListing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// İlan sil
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'İlan bulunamadı' });
    }

    if (listing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    await listing.remove();
    res.json({ message: 'İlan silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 