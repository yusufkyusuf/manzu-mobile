import { z } from 'zod';

// Same rules/messages as manzu-f app/pharmacy/(auth)/login/page.jsx and backend loginSchema.
export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  pin: z.string().length(6, 'PIN must be exactly 6 digits').regex(/^\d{6}$/, 'PIN must contain only numbers'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
