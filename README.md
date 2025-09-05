# Pazarlio API - Backend

Bu repository, Pazarlio sitesinin backend API'sini içerir.

## 🚀 Railway'de Deploy Etme

### 1. **Railway Hesabı Oluşturun**
- [railway.app](https://railway.app) adresine gidin
- GitHub ile giriş yapın

### 2. **Proje Oluşturun**
- **"New Project"** tıklayın
- **"Deploy from GitHub repo"** seçin
- Bu repository'yi seçin

### 3. **Environment Variables Ekleyin**
Railway'de şu değişkenleri ekleyin:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://jwanqq:Hirciv1919@pazar-lio.orwnwc3.mongodb.net/pazarlio?retryWrites=true&w=majority&appName=pazar-lio
FRONTEND_URL=https://pazar-lio.com
JWT_SECRET=pazarlio_jwt_secret_key_2025
```

### 4. **Deploy Edin**
- Railway otomatik olarak deploy edecek
- URL'yi alın ve frontend'de kullanın

## 📝 API Endpoints

- `GET /api/listings` - Tüm ilanları getir
- `POST /api/listings` - Yeni ilan oluştur
- `GET /api/listings/:id` - Belirli ilanı getir
- `PUT /api/listings/:id` - İlanı güncelle
- `DELETE /api/listings/:id` - İlanı sil
- `POST /api/users/register` - Kullanıcı kaydı
- `POST /api/users/login` - Kullanıcı girişi

## 🔧 Yerel Geliştirme

```bash
npm install
npm run dev
```

## 📞 Destek

Herhangi bir sorun yaşarsanız, GitHub Issues'da bildirin.
