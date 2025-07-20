import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(4, "Password must be needed"),
});

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    referralCode: z.string().optional(),
    agreeToPrivacyPolicy: z.boolean().refine((val) => val === true, {
      message: "You must agree to the privacy policy",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  export const cardValidation = {
    isValidCardNumber: (number: string): boolean => {
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
    },

    isValidExpiryDate: (month: string, year: string): boolean => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;

      const expMonth = parseInt(month, 10);
      const expYear = parseInt(year, 10);

      if (expMonth < 1 || expMonth > 12) return false;
      if (expYear < currentYear) return false;
      if (expYear === currentYear && expMonth < currentMonth) return false;

      return true;
    },

    isValidCVV: (cvv: string, cardBrand: string): boolean => {
      if (!/^\d+$/.test(cvv)) return false;

      if (cardBrand === "amex") {
        return cvv.length === 4;
      } else {
        return cvv.length === 3;
      }
    },

    formatCardNumber: (number: string): string => {
      const num = number.replace(/\s/g, "");
      const matches = num.match(/\d{4,16}/g);
      const match = (matches && matches[0]) || "";
      const parts = [];

      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }

      if (parts.length) {
        return parts.join(" ");
      } else {
        return num;
      }
    },

    getCardType: (number: string): string => {
      const num = number.replace(/\s/g, "");

      if (/^4/.test(num)) return "visa";
      if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return "mastercard";
      if (/^3[47]/.test(num)) return "amex";
      if (/^6/.test(num)) return "discover";
      if (/^35/.test(num)) return "jcb";
      if (/^30[0-5]/.test(num) || /^36/.test(num) || /^38/.test(num))
        return "diners";

      return "unknown";
    },
  };

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
