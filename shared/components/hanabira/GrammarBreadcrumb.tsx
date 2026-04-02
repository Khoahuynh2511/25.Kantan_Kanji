import Link from 'next/link';

interface GrammarBreadcrumbProps {
  lang: string;
  pTag: string;
  title: string;
  listHref: string;
}

export default function GrammarBreadcrumb({ lang, pTag, title, listHref }: GrammarBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-[var(--secondary-color)] px-5 py-3 flex-wrap">
      <Link href="/" className="hover:underline">Home</Link>
      <span>/</span>
      <Link href={listHref} className="hover:underline">{lang} {pTag}</Link>
      <span>/</span>
      <span className="text-[var(--main-color)] font-medium truncate max-w-xs">{title}</span>
    </nav>
  );
}
