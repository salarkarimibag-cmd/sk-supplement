import mongoose, { Schema } from "mongoose";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  /** Paragraphs separated by a blank line; rendered as separate <p> tags. */
  content: string;
  coverImage: string;
  author: string;
  publishedAt: Date;
}

const BlogPostSchema = new Schema<BlogPost>({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String, required: true },
  author: { type: String, required: true },
  publishedAt: { type: Date, required: true },
});

// Avoids Mongoose's "Cannot overwrite model" error when this module is
// re-evaluated on every hot reload in dev.
export const BlogPostModel =
  mongoose.models.BlogPost ?? mongoose.model("BlogPost", BlogPostSchema);
