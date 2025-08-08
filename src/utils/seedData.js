const User = require('../models/User');
const Cask = require('../models/Cask');
const Offer = require('../models/Offer');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { generateAppreciationData, generateFutureForecasts } = require('./helpers');

// Seed admin user
const seedAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      const admin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@whiskycaskclub.com',
        password: 'Admin123!',
        role: 'admin',
        isEmailVerified: true,
        balance: 1000,
      });
      
      console.log('Admin user created:', admin.email);
      return admin;
    }
    
    console.log('Admin user already exists');
    return adminExists;
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
};

// Seed sample users
const seedSampleUsers = async () => {
  try {
    const userCount = await User.countDocuments();
    
    if (userCount < 5) {
      const sampleUsers = [
        {
          firstName: 'James',
          lastName: 'Wilson',
          email: 'james@example.com',
          password: 'Password123!',
          role: 'user',
          isEmailVerified: true,
          balance: 150,
        },
        {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah@example.com',
          password: 'Password123!',
          role: 'user',
          isEmailVerified: true,
          balance: 200,
        },
        {
          firstName: 'Michael',
          lastName: 'Brown',
          email: 'michael@example.com',
          password: 'Password123!',
          role: 'manager',
          isEmailVerified: true,
          balance: 500,
        },
        {
          firstName: 'Emma',
          lastName: 'Davis',
          email: 'emma@example.com',
          password: 'Password123!',
          role: 'user',
          isEmailVerified: true,
          balance: 75,
        },
      ];

      const createdUsers = await User.insertMany(sampleUsers);
      console.log(`Created ${createdUsers.length} sample users`);
      return createdUsers;
    }
    
    console.log('Sample users already exist');
    return await User.find({ role: { $ne: 'admin' } }).limit(4);
  } catch (error) {
    console.error('Error seeding sample users:', error);
  }
};

// Seed sample casks
const seedSampleCasks = async () => {
  try {
    const caskCount = await Cask.countDocuments();
    
    if (caskCount < 10) {
      const users = await User.find({ role: 'user' });
      
      if (users.length === 0) {
        console.log('No users found to assign casks to');
        return;
      }

      const sampleCasks = [
        {
          name: 'Macallan',
          distillery: 'The Macallan',
          year: 1998,
          volume: '500L',
          abv: '63.2%',
          location: 'New York, USA',
          estimatedValue: '$15,500',
          purchasePrice: 14000,
          currentValue: 15500,
          gain: '+$1,500',
          gainPercentage: '+10.7%',
          totalGain: '+120%',
          status: 'Ready',
          image: 'https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg',
          details: {
            volume: '500 Litres',
            abv: '63.2%',
            years: '25 Years',
            warehouseLocation: 'New York, USA',
          },
          appreciationData: generateAppreciationData(12000, 15500),
          currentAppreciation: '29.2%',
          futureForecasts: generateFutureForecasts(15500),
          projectedAppreciation: '+38.7%',
          owner: users[0]._id,
          rating: 4.8,
        },
        {
          name: 'Ardbeg',
          distillery: 'Ardbeg',
          year: 1998,
          volume: '500L',
          abv: '63.2%',
          location: 'Islay, Scotland',
          estimatedValue: '$13,200',
          purchasePrice: 12000,
          currentValue: 13200,
          gain: '+$1,200',
          gainPercentage: '+10.0%',
          totalGain: '+85%',
          status: 'Maturing',
          image: 'https://images.pexels.com/photos/3649262/pexels-photo-3649262.jpeg',
          details: {
            bottle: '6 Bottle',
            packaging: 'Premium Gift Box',
            volume: '700ml each',
            certificates: 'Authenticity Included',
          },
          appreciationData: generateAppreciationData(10000, 13200),
          currentAppreciation: '24.8%',
          futureForecasts: generateFutureForecasts(13200),
          projectedAppreciation: '+32.1%',
          owner: users[0]._id,
          rating: 4.6,
        },
        // Add more sample casks...
      ];

      // Distribute casks among users
      const casksWithOwners = sampleCasks.map((cask, index) => ({
        ...cask,
        owner: users[index % users.length]._id,
      }));

      const createdCasks = await Cask.insertMany(casksWithOwners);
      console.log(`Created ${createdCasks.length} sample casks`);
      return createdCasks;
    }
    
    console.log('Sample casks already exist');
    return await Cask.find().limit(10);
  } catch (error) {
    console.error('Error seeding sample casks:', error);
  }
};

// Seed sample offers
const seedSampleOffers = async () => {
  try {
    const offerCount = await Offer.countDocuments();
    
    if (offerCount < 5) {
      const admin = await User.findOne({ role: 'admin' });
      
      if (!admin) {
        console.log('No admin user found to create offers');
        return;
      }

      const sampleOffers = [
        {
          title: 'Rare Macallan 30yr Cask',
          description: 'A highly sought-after single malt matured for three decades, offering exceptional depth and investment value.',
          type: 'cask',
          image: 'https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg',
          originalPrice: '18,000',
          currentPrice: '15,500',
          priceNumeric: 15500,
          location: 'New York, USA',
          rating: 4.9,
          daysLeft: 7,
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          details: {
            distillery: 'Macallan',
            vintage: '1998',
            volume: '500L',
            abv: '63.2%',
            maturationPeriod: '30 Years',
            caskType: 'Sherry Hogshead',
          },
          badge: 'Cask',
          createdBy: admin._id,
          isFeatured: true,
        },
        {
          title: 'Limited Edition Bottle Set',
          description: 'Collector\'s set of 6 rare bottles from prestigious distilleries.',
          type: 'bottle',
          image: 'https://images.pexels.com/photos/3649262/pexels-photo-3649262.jpeg',
          originalPrice: '2,500',
          currentPrice: '2,200',
          priceNumeric: 2200,
          location: 'Edinburgh, Scotland',
          rating: 4.7,
          daysLeft: 14,
          expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          details: {
            bottle: '6 Bottle',
            packaging: 'Premium Gift Box',
            volume: '700ml each',
            certificates: 'Authenticity Included',
          },
          badge: 'Bottle',
          createdBy: admin._id,
          isFeatured: false,
        },
        {
          title: 'Whisky Tasting Experience',
          description: 'Private tasting with master distiller including rare expressions',
          type: 'experience',
          image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
          originalPrice: '800',
          currentPrice: '500',
          priceNumeric: 500,
          location: 'Glasgow, Scotland',
          rating: 4.9,
          daysLeft: 21,
          expiryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          details: {
            duration: '3 Hours',
            tastings: '12 Premium Whiskies',
            participants: 'Up to 8 people',
            includes: 'Food Pairing',
          },
          badge: 'Experience',
          createdBy: admin._id,
          isFeatured: true,
        },
      ];

      const createdOffers = await Offer.insertMany(sampleOffers);
      console.log(`Created ${createdOffers.length} sample offers`);
      return createdOffers;
    }
    
    console.log('Sample offers already exist');
    return await Offer.find().limit(5);
  } catch (error) {
    console.error('Error seeding sample offers:', error);
  }
};

// Seed sample activities
const seedSampleActivities = async () => {
  try {
    const activityCount = await Activity.countDocuments();
    
    if (activityCount < 10) {
      const users = await User.find({ role: 'user' });
      const casks = await Cask.find().limit(5);
      
      if (users.length === 0 || casks.length === 0) {
        console.log('No users or casks found to create activities');
        return;
      }

      const sampleActivities = [
        {
          title: 'Macallan 25yr increased by $500',
          subtitle: 'Portfolio value increased',
          type: 'gain',
          user: users[0]._id,
          relatedModel: 'Cask',
          relatedId: casks[0]._id,
          amount: 500,
          badge: '+9.3%',
        },
        {
          title: 'New exclusive offer available',
          subtitle: 'Check out the latest investment opportunity',
          type: 'offer',
          user: users[0]._id,
          badge: 'New',
        },
        {
          title: 'Referral reward earned: $50',
          subtitle: 'Thank you for referring a friend',
          type: 'reward',
          user: users[0]._id,
          amount: 50,
          badge: 'Reward',
        },
      ];

      // Create activities for multiple users
      const activitiesWithUsers = [];
      sampleActivities.forEach(activity => {
        users.forEach(user => {
          activitiesWithUsers.push({
            ...activity,
            user: user._id,
          });
        });
      });

      const createdActivities = await Activity.insertMany(activitiesWithUsers.slice(0, 15));
      console.log(`Created ${createdActivities.length} sample activities`);
      return createdActivities;
    }
    
    console.log('Sample activities already exist');
    return await Activity.find().limit(10);
  } catch (error) {
    console.error('Error seeding sample activities:', error);
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    const admin = await seedAdminUser();
    const users = await seedSampleUsers();
    const casks = await seedSampleCasks();
    const offers = await seedSampleOffers();
    const activities = await seedSampleActivities();
    
    console.log('✅ Database seeding completed successfully!');
    
    return {
      admin,
      users,
      casks,
      offers,
      activities,
    };
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// Clear all data (use with caution)
const clearDatabase = async () => {
  try {
    console.log('🗑️ Clearing database...');
    
    await Promise.all([
      User.deleteMany({}),
      Cask.deleteMany({}),
      Offer.deleteMany({}),
      Activity.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    
    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Database clearing failed:', error);
    throw error;
  }
};

module.exports = {
  seedDatabase,
  clearDatabase,
  seedAdminUser,
  seedSampleUsers,
  seedSampleCasks,
  seedSampleOffers,
  seedSampleActivities,
};