import type { Post } from "../types.js";

export const samplePosts: Omit<Post, "id" | "publishedAt" | "updatedAt">[] = [
  {
    title: "The Bear Review: Fine Dining, Family Damage",
    slug: "the-bear-review-fine-dining-family-damage",
    excerpt: "A pressure-cooker series where grief wears an apron and every ticket sounds like a small emergency.",
    tags: ["TV", "Drama", "Streaming"],
    seoTitle: "The Bear Review: Is It Worth Watching?",
    seoDescription: "A sharp review of The Bear, its emotional heat, kitchen chaos, and whether the acclaimed series deserves your weekend.",
    contentHtml: "<p><strong>The Bear</strong> understands that restaurants are not workplaces so much as weather systems.</p><p>It serves panic, loyalty, ambition, and family history on the same chipped plate. The result earns <strong>3 Golden Pages</strong>: noisy, tender, and almost too alive.</p>"
  },
  {
    title: "Atomic Habits Review: Tiny Levers, Large Machinery",
    slug: "atomic-habits-review-tiny-levers-large-machinery",
    excerpt: "A business-shelf classic that makes self-improvement feel less like thunder and more like plumbing.",
    tags: ["Business", "Psychology", "Books"],
    seoTitle: "Atomic Habits Review: Still Worth Reading?",
    seoDescription: "A witty, practical review of Atomic Habits covering its best ideas, weak spots, and value for entrepreneurs.",
    contentHtml: "<p><strong>Atomic Habits</strong> is not magic. This is good news. Magic is unreliable and badly documented.</p><p>James Clear gives readers a toolbox that actually has labels. Final verdict: <strong>3 Sharp Pencils</strong>.</p>"
  },
  {
    title: "Succession Review: Billionaires Without Weather",
    slug: "succession-review-billionaires-without-weather",
    excerpt: "A tragicomic empire where every room is expensive and nobody can afford a sincere sentence.",
    tags: ["TV", "Satire", "Business"],
    seoTitle: "Succession Review: Is It Worth Watching?",
    seoDescription: "An elegant review of Succession, the HBO family-business tragedy disguised as premium insult comedy.",
    contentHtml: "<p><strong>Succession</strong> is a corporate ghost story: everyone is haunted by a living father.</p><p>It is vicious, funny, and built with surgical patience. Rating: <strong>3 Golden Pages</strong>.</p>"
  }
];

export const defaultMasterPrompt = `You are the author of a literary and entertainment review blog: a sharp, elegant, ironic Michelin Guide for books and TV series. Write witty, useful reviews with clear verdicts, SEO metadata, FAQ, and a memorable final line. Return only JSON with title, slug, excerpt, tags, seoTitle, seoDescription, contentHtml.`;
