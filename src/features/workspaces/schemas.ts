import { z } from "zod";

const workspaceImageSchema = z.union([
  z.instanceof(File)
    .refine((file) => file.size <= 1024 * 1024, "Image must be 1 MB or smaller")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/svg+xml"].includes(file.type),
      "Upload a JPG, PNG, or SVG image",
    ),
  z.string(),
]).optional();

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  image: workspaceImageSchema,
});

export const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(1, "Must be 1 or more characters").optional(),
  image: workspaceImageSchema,
});
