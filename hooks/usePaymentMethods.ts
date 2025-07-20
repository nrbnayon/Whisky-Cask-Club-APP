// hooks/usePaymentMethods.ts
import { useState, useEffect } from "react";
import { stripeService, StripePaymentMethod } from "@/utils/stripeService";
import { showToast } from "@/utils/toast";

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<StripePaymentMethod[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await stripeService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error("Error loading payment methods:", error);
      showToast("error", "Error", "Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  const refreshPaymentMethods = async () => {
    try {
      setRefreshing(true);
      const methods = await stripeService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error("Error refreshing payment methods:", error);
      showToast("error", "Error", "Failed to refresh payment methods");
    } finally {
      setRefreshing(false);
    }
  };

  const removePaymentMethod = async (paymentMethodId: string) => {
    try {
      await stripeService.removePaymentMethod(paymentMethodId);
      setPaymentMethods((prev) =>
        prev.filter((method) => method.id !== paymentMethodId)
      );
      showToast("success", "Removed", "Payment method removed successfully");
    } catch (error) {
      console.error("Error removing payment method:", error);
      showToast("error", "Error", "Failed to remove payment method");
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  return {
    paymentMethods,
    loading,
    refreshing,
    loadPaymentMethods,
    refreshPaymentMethods,
    removePaymentMethod,
  };
}
