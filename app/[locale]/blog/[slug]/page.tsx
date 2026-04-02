'use client';

import { use } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';

const BLOG_CONTENT: Record<string, string> = {
  gambari: `# Gambari — The Japanese Art of Perseverance

**Gambari** (頑張り) is a deeply embedded concept in Japanese culture that embodies the spirit of perseverance, endurance, and doing one's best regardless of circumstances.

## What Does Gambari Mean?

The word comes from the verb *gambaru* (頑張る), which literally means to "stand firm" or "hold on." In daily Japanese life, you'll hear *gambatte* (頑張って) — "do your best" or "hang in there" — as a common expression of encouragement.

## Cultural Significance

In Japanese society, gambari reflects the collective values of:

- **Persistence** over innate talent
- **Effort** as a moral virtue
- **Group solidarity** through shared struggle

## Gambari in Practice

From students preparing for entrance exams to athletes training for competition, the gambari spirit manifests across all aspects of Japanese life. It's seen in the concept of *shokunin* (職人), the dedicated craftsman who spends decades perfecting their art.

## Learning Japanese with Gambari

As language learners, we can draw inspiration from this concept. Language acquisition is a marathon, not a sprint. Every grammar point studied, every vocabulary word reviewed, every reading passage completed is an act of gambari.

*頑張ってください！* (Gambatte kudasai!) — Please do your best!
`,
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: PageProps) {
  const { slug } = use(params);
  const content = BLOG_CONTENT[slug];

  if (!content) {
    return (
      <main className="min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link href="/blog" className="text-[var(--secondary-color)] hover:underline">
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/blog" className="text-sm text-[var(--secondary-color)] hover:underline mb-6 inline-block">
          Blog
        </Link>
        <div className="prose prose-neutral dark:prose-invert max-w-none text-[var(--main-color)]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
    </main>
  );
}
