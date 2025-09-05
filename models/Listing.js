const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  priceType: {
    type: String,
    enum: ['fixed', 'negotiable'],
    default: 'fixed'
  },
  location: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  mainCategory: {
    type: String,
    required: true,
    trim: true
  },
  subCategory: {
    type: String,
    required: true,
    trim: true
  },
  // Vasıta özel alanları
  vehicleDetails: {
    brand: String,
    series: String,
    model: String,
    year: Number,
    fuel: String,
    transmission: String,
    mileage: Number,
    bodyType: String,
    color: String,
    damageRecord: String,
    exchange: String
  },
  // Emlak özel alanları
  propertyDetails: {
    propertyType: String,
    listingType: String,
    area: Number,
    roomCount: String,
    buildingAge: String,
    floor: Number,
    totalFloors: Number,
    heating: String,
    furnished: String,
    balcony: Boolean,
    elevator: Boolean,
    parking: Boolean,
    // Arapça alanlar
    نوع_العقار: String,
    نوع_الإعلان: String,
    المساحة: Number,
    عدد_الغرف: String,
    عمر_البناء: String,
    الطابق: Number,
    عدد_الطوابق: Number,
    التدفئة: String,
    مفروش: String,
    شرفة: String,
    مصعد: String,
    موقف_سيارات: String
  },
  // İkinci el özel alanları
  usedItemDetails: {
    mainCategory: String,
    subCategory: String,
    itemCondition: String,
    brand: String,
    model: String,
    shippingAvailable: String,
    warrantyStatus: String,
    exchangePossible: String,
    // Arapça alanlar
    الفئة_الرئيسية: String,
    الفئة_الفرعية: String,
    حالة_المنتج: String,
    العلامة_التجارية: String,
    الموديل: String,
    الشحن_متاح: String,
    الضمان: String,
    إمكانية_المقايضة: String
  },
  // İletişim bilgileri
  contact: {
    name: String,
    phone: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'inactive'],
    default: 'active'
  },
  // Promosyon alanları
  featured: {
    type: Boolean,
    default: false
  },
  featuredUntil: {
    type: Date,
    default: null
  },
  promotionType: {
    type: String,
    enum: ['none', 'vitrin', 'kesfet', 'kesfet_free', 'spotlight'],
    default: 'none'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Listing', listingSchema); 