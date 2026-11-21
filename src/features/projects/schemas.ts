import { z } from "zod";

const projectImageSchema = z.union([
  z.instanceof(File)
    .refine((file) => file.size <= 1024 * 1024, "Image must be 1 MB or smaller")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/svg+xml"].includes(file.type),
      "Upload a JPG, PNG, or SVG image",
    ),
  z.string(),
]).optional();

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  image: projectImageSchema,
  workspaceId: z.string().trim().min(1, "Required"),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1, "Minimum 1 character required").optional(),
  image: projectImageSchema,
});
