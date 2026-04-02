import Link from 'next/link';

export const metadata = {
  title: 'Blog',
  description: 'Articles about Japanese culture, history, and society.',
};

const BLOG_POSTS = [
  {
    slug: 'gambari',
    title: 'Gambari',
    description: 'Gambari: The Japanese Concept of Perseverance, Resilience, and Endurance in the Face of Adversity and its Cultural Significance.',
    date: '2024-01-01',
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
        <p className="text-[var(--secondary-color)] mb-8">
          Articles about Japanese culture, history, and society.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BLOG_POSTS.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block border border-[var(--border-color)] rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-[var(--card-color)]"
            >
              <div className="p-5">
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <p className="text-sm text-[var(--secondary-color)]">{post.description}</p>
                <p className="text-xs text-[var(--secondary-color)] mt-3">{post.date}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
