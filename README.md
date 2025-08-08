# Whisky Cask Club - Backend API

A comprehensive Node.js/Express.js backend API for the Whisky Cask Club mobile application, featuring role-based authentication, MongoDB with aggregation framework, file uploads, and Stripe payment integration.

## 🚀 Features

- **Role-Based Authentication** (User, Manager, Admin)
- **Complete CRUD Operations** for all resources
- **MongoDB with Aggregation Framework** for complex queries
- **File Upload System** with Multer
- **Stripe Payment Integration** for payments and payouts
- **Email Service** with Nodemailer
- **Comprehensive API Documentation**
- **Error Handling & Validation**
- **Security Best Practices**
- **Modular Architecture**

## 📋 Prerequisites

- Node.js (v18.0.0 or higher)
- MongoDB Atlas account
- Stripe account (for payments)
- Email service (Gmail recommended)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whisky-cask-club-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URL=mongodb+srv://nrbnayon:chatters@cluster0.f6x2ow6.mongodb.net/WhiskyCaskClubAPP?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_here
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Create upload directories**
   ```bash
   mkdir -p uploads/{users,casks,offers,documents,temp}
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "referralCode": "OPTIONAL123"
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!"
}
```

### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890"
}
```

## 👥 User Management

### Get All Users (Admin)
```http
GET /api/users?page=1&limit=20&search=john&role=user
Authorization: Bearer <admin_token>
```

### Get User Dashboard
```http
GET /api/users/dashboard
Authorization: Bearer <token>
```

### Update User Role (Admin)
```http
PUT /api/users/:id/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "manager"
}
```

## 🥃 Cask Management

### Get User Casks
```http
GET /api/casks/my-casks?page=1&limit=20&status=Ready
Authorization: Bearer <token>
```

### Get All Casks (Admin)
```http
GET /api/casks?page=1&limit=20&search=macallan&status=Ready
Authorization: Bearer <admin_token>
```

### Create Cask (Admin)
```http
POST /api/casks
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "name": "Macallan 25yr",
  "distillery": "The Macallan",
  "year": 1998,
  "volume": "500L",
  "abv": "63.2%",
  "location": "Scotland",
  "purchasePrice": 14000,
  "currentValue": 15500,
  "owner": "user_id_here",
  "caskImages": [file1, file2]
}
```

### Update Cask
```http
PUT /api/casks/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "currentValue": 16000,
  "status": "Ready"
}
```

## 🎯 Offer Management

### Get All Offers (Public)
```http
GET /api/offers?page=1&limit=20&type=cask&search=macallan
```

### Get Featured Offers
```http
GET /api/offers/featured?limit=5
```

### Create Offer (Admin)
```http
POST /api/offers
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

{
  "title": "Rare Macallan 30yr Cask",
  "description": "Premium investment opportunity",
  "type": "cask",
  "originalPrice": "18,000",
  "currentPrice": "15,500",
  "priceNumeric": 15500,
  "location": "Scotland",
  "rating": 4.9,
  "expiryDate": "2025-02-15",
  "image": [main_image_file],
  "images": [additional_image_files]
}
```

### Express Interest
```http
POST /api/offers/:id/express-interest
Authorization: Bearer <token>
```

## 🛒 Purchase Management

### Create Purchase (Express Interest)
```http
POST /api/purchases
Authorization: Bearer <token>
Content-Type: application/json

{
  "offer": "offer_id_here",
  "investmentAmountNumeric": 15000,
  "personalInfo": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "preferredContactMethod": "email"
  }
}
```

### Get User Purchases
```http
GET /api/purchases/my-purchases?page=1&limit=20&status=Pending
Authorization: Bearer <token>
```

### Update Purchase Status (Admin)
```http
PUT /api/purchases/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "Active",
  "reason": "Investment approved"
}
```

## 🔔 Notification Management

### Get User Notifications
```http
GET /api/notifications?page=1&limit=20&type=portfolio&isRead=false
Authorization: Bearer <token>
```

### Mark as Read
```http
PATCH /api/notifications/:id/read
Authorization: Bearer <token>
```

### Create Notification (Admin)
```http
POST /api/notifications
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "New Feature Available",
  "message": "Check out our new portfolio analytics",
  "type": "system",
  "recipient": "user_id_here",
  "priority": "medium"
}
```

## 📊 Activity Tracking

### Get User Activities
```http
GET /api/activities?page=1&limit=20&type=gain
Authorization: Bearer <token>
```

### Get Activity Analytics (Admin)
```http
GET /api/activities/admin/analytics?period=30d
Authorization: Bearer <admin_token>
```

## 🤝 Referral System

### Get User Referral Data
```http
GET /api/referrals/my-referrals
Authorization: Bearer <token>
```

### Validate Referral Code
```http
GET /api/referrals/validate/JAMES2024
```

### Update Referral Status (Admin)
```http
PUT /api/referrals/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "completed",
  "rewardAmount": 50
}
```

## 💳 Payment System

### Get Payment Methods
```http
GET /api/payments/methods
Authorization: Bearer <token>
```

### Add Payment Method
```http
POST /api/payments/methods
Authorization: Bearer <token>
Content-Type: application/json

{
  "cardNumber": "4242424242424242",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "cvc": "123",
  "cardholderName": "John Doe"
}
```

### Request Payout
```http
POST /api/payments/payout
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100,
  "paymentMethodId": "payment_method_id_here"
}
```

## 🔧 Admin Dashboard

### Get Dashboard Statistics
```http
GET /api/admin/dashboard?period=30d
Authorization: Bearer <admin_token>
```

### Get System Health
```http
GET /api/admin/system-health
Authorization: Bearer <admin_token>
```

### Bulk Operations
```http
POST /api/admin/bulk-operations
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "operation": "update",
  "model": "User",
  "ids": ["id1", "id2"],
  "data": { "isActive": true }
}
```

### Export Data
```http
GET /api/admin/export?model=users&format=json
Authorization: Bearer <admin_token>
```

## 📁 File Upload

### Single File Upload
```http
POST /api/upload/single
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: [your_file]
```

### Multiple Files Upload
```http
POST /api/upload/multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: [file1, file2, file3]
```

## 🗂️ Project Structure

```
src/
├── controllers/          # Route controllers
│   ├── authController.js
│   ├── userController.js
│   ├── caskController.js
│   ├── offerController.js
│   ├── purchaseController.js
│   ├── notificationController.js
│   ├── activityController.js
│   ├── referralController.js
│   ├── paymentController.js
│   └── adminController.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   ├── validation.js
│   ├── upload.js
│   ├── errorHandler.js
│   └── notFound.js
├── models/              # Mongoose models
│   ├── User.js
│   ├── Cask.js
│   ├── Offer.js
│   ├── Purchase.js
│   ├── Notification.js
│   ├── Activity.js
│   ├── Referral.js
│   └── Payment.js
├── routes/              # Express routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── caskRoutes.js
│   ├── offerRoutes.js
│   ├── purchaseRoutes.js
│   ├── notificationRoutes.js
│   ├── activityRoutes.js
│   ├── referralRoutes.js
│   ├── paymentRoutes.js
│   ├── adminRoutes.js
│   └── uploadRoutes.js
├── utils/               # Utility functions
│   ├── emailService.js
│   ├── stripeService.js
│   ├── helpers.js
│   └── seedData.js
└── server.js           # Main server file
```

## 🔒 Security Features

- **JWT Authentication** with secure token generation
- **Password Hashing** with bcryptjs
- **Rate Limiting** to prevent abuse
- **Input Validation** with express-validator
- **File Upload Security** with type and size restrictions
- **CORS Configuration** for cross-origin requests
- **Helmet** for security headers
- **Role-Based Access Control** (RBAC)

## 🧪 Testing

### Default Admin Account
```
Email: admin@whiskycaskclub.com
Password: Admin123!
Role: admin
```

### Test User Account
```
Email: james@example.com
Password: Password123!
Role: user
```

## 📈 Database Aggregation Examples

The backend uses MongoDB's aggregation framework for complex queries:

### User Statistics
```javascript
const userStats = await User.aggregate([
  {
    $group: {
      _id: null,
      totalUsers: { $sum: 1 },
      activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
      totalBalance: { $sum: '$balance' },
    }
  }
]);
```

### Portfolio Analytics
```javascript
const portfolioStats = await Cask.aggregate([
  { $match: { owner: userId } },
  {
    $group: {
      _id: null,
      totalCasks: { $sum: 1 },
      totalValue: { $sum: '$currentValue' },
      totalGain: { $sum: { $subtract: ['$currentValue', '$purchasePrice'] } },
    }
  }
]);
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URL=your_production_mongodb_url
JWT_SECRET=your_very_secure_jwt_secret
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
```

### PM2 Configuration
```bash
npm install -g pm2
pm2 start src/server.js --name "whisky-cask-api"
pm2 startup
pm2 save
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 100,
      "limit": 20
    }
  }
}
```

## 🔧 Maintenance

### Database Seeding
```bash
# Seed initial data (run once)
node -e "require('./src/utils/seedData').seedDatabase()"
```

### Cleanup Operations
```bash
# Clean up old files
node -e "require('./src/middleware/upload').cleanupOldFiles('./uploads/temp')"
```

## 📞 Support

For technical support or questions about the API, please contact:
- Email: support@whiskycaskclub.com
- Documentation: [API Docs URL]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.