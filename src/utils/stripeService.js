const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  // Create customer
  async createCustomer(userData) {
    try {
      const customer = await stripe.customers.create({
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        metadata: {
          userId: userData._id.toString(),
        },
      });
      
      return customer;
    } catch (error) {
      console.error('Stripe create customer error:', error);
      throw error;
    }
  }

  // Create payment method
  async createPaymentMethod(cardData) {
    try {
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardData.number,
          exp_month: cardData.exp_month,
          exp_year: cardData.exp_year,
          cvc: cardData.cvc,
        },
        billing_details: {
          name: cardData.name,
          email: cardData.email,
        },
      });
      
      return paymentMethod;
    } catch (error) {
      console.error('Stripe create payment method error:', error);
      throw error;
    }
  }

  // Attach payment method to customer
  async attachPaymentMethod(paymentMethodId, customerId) {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      
      return paymentMethod;
    } catch (error) {
      console.error('Stripe attach payment method error:', error);
      throw error;
    }
  }

  // Create payment intent
  async createPaymentIntent(data) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency.toLowerCase(),
        customer: data.customerId,
        payment_method: data.paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        description: data.description,
        metadata: {
          userId: data.userId,
          purchaseId: data.purchaseId,
        },
      });
      
      return paymentIntent;
    } catch (error) {
      console.error('Stripe create payment intent error:', error);
      throw error;
    }
  }

  // Confirm payment intent
  async confirmPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Stripe confirm payment intent error:', error);
      throw error;
    }
  }

  // Create refund
  async createRefund(paymentIntentId, amount, reason) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason || 'requested_by_customer',
      });
      
      return refund;
    } catch (error) {
      console.error('Stripe create refund error:', error);
      throw error;
    }
  }

  // Create payout (requires Stripe Connect)
  async createPayout(data) {
    try {
      // Note: This requires Stripe Connect setup for marketplace functionality
      const payout = await stripe.payouts.create({
        amount: Math.round(data.amount * 100),
        currency: data.currency.toLowerCase(),
        description: data.description,
        metadata: {
          userId: data.userId,
        },
      });
      
      return payout;
    } catch (error) {
      console.error('Stripe create payout error:', error);
      throw error;
    }
  }

  // Get payment method
  async getPaymentMethod(paymentMethodId) {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      return paymentMethod;
    } catch (error) {
      console.error('Stripe get payment method error:', error);
      throw error;
    }
  }

  // List customer payment methods
  async listCustomerPaymentMethods(customerId) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      
      return paymentMethods;
    } catch (error) {
      console.error('Stripe list payment methods error:', error);
      throw error;
    }
  }

  // Detach payment method
  async detachPaymentMethod(paymentMethodId) {
    try {
      const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
      return paymentMethod;
    } catch (error) {
      console.error('Stripe detach payment method error:', error);
      throw error;
    }
  }

  // Handle webhook events
  async handleWebhook(body, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log('Stripe webhook event:', event.type);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'payout.paid':
          await this.handlePayoutPaid(event.data.object);
          break;
        case 'payout.failed':
          await this.handlePayoutFailed(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return event;
    } catch (error) {
      console.error('Stripe webhook error:', error);
      throw error;
    }
  }

  // Handle successful payment
  async handlePaymentSucceeded(paymentIntent) {
    try {
      const { Payment } = require('../models/Payment');
      const Activity = require('../models/Activity');
      const Notification = require('../models/Notification');

      // Update payment status
      const payment = await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { status: 'succeeded' },
        { new: true }
      ).populate('user purchase');

      if (payment) {
        // Create activity
        await Activity.createActivity({
          title: 'Payment Successful',
          subtitle: `Payment of $${payment.amount} completed`,
          type: 'purchase',
          user: payment.user._id,
          relatedModel: 'Payment',
          relatedId: payment._id,
          amount: payment.amount,
          badge: 'Paid',
        });

        // Create notification
        await Notification.createNotification({
          title: 'Payment Successful',
          message: `Your payment of $${payment.amount} has been processed successfully`,
          type: 'payment',
          recipient: payment.user._id,
          relatedModel: 'Payment',
          relatedId: payment._id,
        });
      }
    } catch (error) {
      console.error('Handle payment succeeded error:', error);
    }
  }

  // Handle failed payment
  async handlePaymentFailed(paymentIntent) {
    try {
      const { Payment } = require('../models/Payment');
      const Notification = require('../models/Notification');

      // Update payment status
      const payment = await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { 
          status: 'failed',
          failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
        },
        { new: true }
      ).populate('user');

      if (payment) {
        // Create notification
        await Notification.createNotification({
          title: 'Payment Failed',
          message: `Your payment of $${payment.amount} could not be processed. Please try again.`,
          type: 'payment',
          recipient: payment.user._id,
          relatedModel: 'Payment',
          relatedId: payment._id,
          priority: 'high',
        });
      }
    } catch (error) {
      console.error('Handle payment failed error:', error);
    }
  }

  // Handle successful payout
  async handlePayoutPaid(payout) {
    try {
      const { Payout } = require('../models/Payment');
      const Activity = require('../models/Activity');
      const Notification = require('../models/Notification');

      // Update payout status
      const payoutRecord = await Payout.findOneAndUpdate(
        { stripePayoutId: payout.id },
        { status: 'paid' },
        { new: true }
      ).populate('user');

      if (payoutRecord) {
        // Create activity
        await Activity.createActivity({
          title: 'Payout Completed',
          subtitle: `Payout of $${payoutRecord.amount} completed`,
          type: 'money',
          user: payoutRecord.user._id,
          relatedModel: 'Payout',
          relatedId: payoutRecord._id,
          amount: payoutRecord.amount,
          badge: 'Completed',
        });

        // Create notification
        await Notification.createNotification({
          title: 'Payout Completed',
          message: `Your payout of $${payoutRecord.amount} has been completed successfully`,
          type: 'money',
          recipient: payoutRecord.user._id,
          relatedModel: 'Payout',
          relatedId: payoutRecord._id,
        });
      }
    } catch (error) {
      console.error('Handle payout paid error:', error);
    }
  }

  // Handle failed payout
  async handlePayoutFailed(payout) {
    try {
      const { Payout } = require('../models/Payment');
      const User = require('../models/User');
      const Activity = require('../models/Activity');
      const Notification = require('../models/Notification');

      // Update payout status
      const payoutRecord = await Payout.findOneAndUpdate(
        { stripePayoutId: payout.id },
        { 
          status: 'failed',
          failureReason: payout.failure_message || 'Payout failed'
        },
        { new: true }
      ).populate('user');

      if (payoutRecord) {
        // Refund amount to user balance
        await User.findByIdAndUpdate(payoutRecord.user._id, {
          $inc: { balance: payoutRecord.amount }
        });

        // Create activity
        await Activity.createActivity({
          title: 'Payout Failed - Balance Refunded',
          subtitle: `$${payoutRecord.amount} refunded to your balance`,
          type: 'money',
          user: payoutRecord.user._id,
          relatedModel: 'Payout',
          relatedId: payoutRecord._id,
          amount: payoutRecord.amount,
          badge: 'Refunded',
        });

        // Create notification
        await Notification.createNotification({
          title: 'Payout Failed',
          message: `Your payout of $${payoutRecord.amount} failed and has been refunded to your balance`,
          type: 'money',
          recipient: payoutRecord.user._id,
          relatedModel: 'Payout',
          relatedId: payoutRecord._id,
          priority: 'high',
        });
      }
    } catch (error) {
      console.error('Handle payout failed error:', error);
    }
  }
}

module.exports = new StripeService();