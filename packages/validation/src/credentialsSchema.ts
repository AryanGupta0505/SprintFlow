import {z} from "zod";
export const phoneSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Phone number must be of 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  mode: z.enum(["signup", "signin"]),
  name:z.string().optional(),
  email:z.string().email().optional()
}).passthrough();
export type PhoneCredentials = z.infer<typeof phoneSchema>;
