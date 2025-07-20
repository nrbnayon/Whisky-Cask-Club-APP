// utils/stripeService.ts
import { Alert } from "react-native";

export interface StripeCard {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  funding: string;
}

export interface StripePaymentMethod {
  id: string;
  type: "card" | "bank_account";
  card?: StripeCard;
  billing_details: {
    name: string;
    email?: string;
  };
  created: number;
}

export interface PayoutRequest {
  amount: number;
  currency: string;
  paymentMethodId: string;
  description?: string;
}

export interface PayoutResponse {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "in_transit" | "paid" | "failed";
  arrival_date: number;
  destination: string;
}

class StripeService {
  private baseUrl = "https://your-backend-api.com/api";

  // Initialize Stripe (in a real app, this would be done in your backend)
  async initializeStripe() {
    try {
      // This would typically be handled by your backend
      console.log("Stripe initialized");
    } catch (error) {
      console.error("Failed to initialize Stripe:", error);
      throw error;
    }
  }

  // Create payment method
  async createPaymentMethod(cardData: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
    name: string;
  }): Promise<StripePaymentMethod> {
    try {
      // In a real app, this would call your backend API
      const response = await fetch(`${this.baseUrl}/payment-methods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer your-auth-token",
        },
        body: JSON.stringify({
          type: "card",
          card: {
            number: cardData.number,
            exp_month: cardData.exp_month,
            exp_year: cardData.exp_year,
            cvc: cardData.cvc,
          },
          billing_details: {
            name: cardData.name,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment method");
      }

      const paymentMethod: StripePaymentMethod = await response.json();

      // Store payment method locally for demo
      await this.storePaymentMethod(paymentMethod);

      return paymentMethod;
    } catch (error) {
      console.error("Error creating payment method:", error);
      throw error;
    }
  }

  // Get saved payment methods
  async getPaymentMethods(): Promise<StripePaymentMethod[]> {
    try {
      // In a real app, fetch from your backend
      const stored = await this.getStoredPaymentMethods();
      return stored;
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      return [];
    }
  }

  // Create payout
  async createPayout(payoutData: PayoutRequest): Promise<PayoutResponse> {
    try {
      // In a real app, this would call your backend
      const response = await fetch(`${this.baseUrl}/payouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer your-auth-token",
        },
        body: JSON.stringify(payoutData),
      });

      if (!response.ok) {
        throw new Error("Failed to create payout");
      }

      const payout: PayoutResponse = await response.json();
      return payout;
    } catch (error) {
      console.error("Error creating payout:", error);
      throw error;
    }
  }

  // Validate card number using Luhn algorithm
  validateCardNumber(number: string): boolean {
    const num = number.replace(/\s/g, "");
    if (!/^\d+$/.test(num)) return false;

    let sum = 0;
    let shouldDouble = false;

    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  // Get card brand
  getCardBrand(number: string): string {
    const num = number.replace(/\s/g, "");

    if (/^4/.test(num)) return "visa";
    if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return "mastercard";
    if (/^3[47]/.test(num)) return "amex";
    if (/^6/.test(num)) return "discover";
    if (/^35/.test(num)) return "jcb";
    if (/^30[0-5]/.test(num) || /^36/.test(num) || /^38/.test(num))
      return "diners";

    return "unknown";
  }

  // Format card number for display
  formatCardNumber(number: string): string {
    const num = number.replace(/\s/g, "");
    const brand = this.getCardBrand(num);

    if (brand === "amex") {
      return num.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3");
    } else {
      return num.replace(/(\d{4})(?=\d)/g, "$1 ");
    }
  }

  // Local storage methods (for demo purposes)
  private async storePaymentMethod(
    paymentMethod: StripePaymentMethod
  ): Promise<void> {
    try {
      // In a real app, use encrypted secure storage
      const existing = await this.getStoredPaymentMethods();
      const updated = [...existing, paymentMethod];
      // Store in AsyncStorage or similar
      console.log("Payment method stored locally:", paymentMethod);
    } catch (error) {
      console.error("Error storing payment method:", error);
    }
  }

  private async getStoredPaymentMethods(): Promise<StripePaymentMethod[]> {
    try {
      // Mock data for demo
      return [
        {
          id: "pm_1234567890",
          type: "card",
          card: {
            id: "card_1234567890",
            brand: "visa",
            last4: "4242",
            exp_month: 12,
            exp_year: 2025,
            funding: "credit",
          },
          billing_details: {
            name: "John Max",
          },
          created: Date.now(),
        },
      ];
    } catch (error) {
      console.error("Error getting stored payment methods:", error);
      return [];
    }
  }

  // Remove payment method
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/payment-methods/${paymentMethodId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Bearer your-auth-token",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove payment method");
      }

      console.log("Payment method removed:", paymentMethodId);
    } catch (error) {
      console.error("Error removing payment method:", error);
      throw error;
    }
  }

  // Handle errors
  handleStripeError(error: any): string {
    if (error.type === "card_error") {
      switch (error.code) {
        case "card_declined":
          return "Your card was declined. Please try a different card.";
        case "expired_card":
          return "Your card has expired. Please use a different card.";
        case "incorrect_cvc":
          return "The security code is incorrect. Please check and try again.";
        case "processing_error":
          return "An error occurred while processing your card. Please try again.";
        case "incorrect_number":
          return "The card number is incorrect. Please check and try again.";
        default:
          return error.message || "Your card could not be processed.";
      }
    } else if (error.type === "validation_error") {
      return error.message || "Please check your card details.";
    } else {
      return "An unexpected error occurred. Please try again.";
    }
  }
}

export const stripeService = new StripeService();
