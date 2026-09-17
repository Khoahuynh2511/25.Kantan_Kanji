'use client';
import { Link, useRouter, usePathname } from '@/core/i18n/routing';
import {
  House,
  Sparkles,
  TrendingUp,
  Trophy,
  ChevronLeft,
  BookOpen,
  Network,
  FileText,
  ScanText,
  Languages,
  GitBranch,
  Workflow,
  Zap,
  Library,
  LayoutGrid
} from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { useClick } from '@/shared/hooks/useAudio';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { removeLocaleFromPath } from '@/shared/lib/pathUtils';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle
} from '@/shared/components/ui/drawer';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  exact: boolean;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}

const NavItemComponent = ({
  href,
  icon,
  label,
  isActive,
  isExpanded,
  onClick
}: NavItemProps) => (
  <Link
    href={href}
    className={clsx(
      'relative group flex items-center gap-3 rounded-lg transition-all duration-250',
      'py-2.5',
      isExpanded ? 'px-4' : 'px-3 justify-center',
      isActive
        ? 'text-[var(--main-color)] bg-[var(--card-color)]'
        : 'text-[var(--secondary-color)] hover:bg-[var(--card-color)] hover:text-[var(--text-color)]'
    )}
    onClick={onClick}
  >
    {isActive && (
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--main-color)] rounded-r-full before:content-[''] before:absolute before:-top-1 before:-left-0.5 before:w-1.5 before:h-2 before:bg-[var(--main-color)] before:rounded-full before:opacity-60" />
    )}
    <span className='text-xl shrink-0'>{icon}</span>
    <span
      className={clsx(
        'text-lg whitespace-nowrap transition-all duration-250',
        isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
      )}
    >
      {label}
    </span>
    {!isExpanded && (
      <div className='absolute left-full ml-2 px-2 py-1 bg-[var(--card-color)] border border-[var(--border-color)] rounded-md text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg'>
        {label}
      </div>
    )}
  </Link>
);

interface MobileNavItemProps {
  href: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const MobileNavItem = ({
  href,
  icon,
  isActive,
  onClick
}: MobileNavItemProps) => (
  <Link
    href={href}
    className={clsx(
      'flex flex-col justify-center items-center gap-0.5 min-w-0 px-2 py-1 rounded-lg transition-all duration-250',
      isActive
        ? 'text-[var(--main-color)] bg-[var(--border-color)]'
        : 'text-[var(--secondary-color)] hover:bg-[var(--card-color)]'
    )}
    onClick={onClick}
  >
    <span className='text-xl leading-none'>{icon}</span>
  </Link>
);

interface MobileMenuButtonProps {
  isActive: boolean;
  onClick: () => void;
}

const MobileMenuButton = ({ isActive, onClick }: MobileMenuButtonProps) => (
  <button
    type='button'
    className={clsx(
      'flex flex-col justify-center items-center gap-0.5 min-w-0 px-2 py-1 rounded-lg text-xl transition-all duration-250 hover:cursor-pointer',
      isActive
        ? 'text-[var(--main-color)] bg-[var(--border-color)]'
        : 'text-[var(--secondary-color)] hover:bg-[var(--card-color)]'
    )}
    onClick={onClick}
    aria-label='Open all features'
  >
    <LayoutGrid />
  </button>
);

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);

  const hotkeysOn = usePreferencesStore(state => state.hotkeysOn);
  const isExpanded = usePreferencesStore(state => state.sidebarExpanded);
  const toggleSidebar = usePreferencesStore(state => state.toggleSidebar);

  const { playClick } = useClick();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const escButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!hotkeysOn) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (event.key === 'Escape') {
        escButtonRef.current?.click();
      } else if (!isInputFocused && event.key.toLowerCase() === 'h') {
        router.push('/');
      } else if (!isInputFocused && event.key.toLowerCase() === 'p') {
        router.push('/preferences');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hotkeysOn, router]);

  const mainItems: NavItem[] = [
    { href: '/', icon: <House />, label: 'Home', exact: true },
    {
      href: '/dictionary',
      icon: <BookOpen />,
      label: 'Dictionary',
      exact: true
    },
    { href: '/kanji', icon: '字', label: 'Kanji', exact: false },
    { href: '/kanji-map', icon: <Network />, label: 'Kanji Map', exact: false },
    { href: '/quick-kanji', icon: <Zap />, label: 'Quick Kanji', exact: false },
    { href: '/radicals', icon: '部', label: 'Radicals', exact: false },
    { href: '/vocabulary', icon: '語', label: 'Vocabulary', exact: false },
    {
      href: '/quick-vocab',
      icon: <Library />,
      label: 'Quick Vocab',
      exact: false
    },
    { href: '/kana', icon: 'あ', label: 'Kana', exact: false },
    {
      href: '/japanese/grammarlist',
      icon: <Languages />,
      label: 'Grammar',
      exact: false
    },
    { href: '/reading', icon: <FileText />, label: 'Reading', exact: false },
    {
      href: '/text-parser',
      icon: <ScanText />,
      label: 'Text Parser',
      exact: false
    },
    { href: '/progress', icon: <TrendingUp />, label: 'Progress', exact: true },
    {
      href: '/achievements',
      icon: <Trophy />,
      label: 'Achievements',
      exact: true
    },
    {
      href: '/preferences',
      icon: (
        <Sparkles
          className={clsx(
            'shrink-0',
            pathWithoutLocale !== '/preferences' && 'motion-safe:animate-bounce'
          )}
        />
      ),
      label: 'Preferences',
      exact: true
    }
  ];

  const experimentItems: NavItem[] = [
    {
      href: '/word-hierarchy',
      icon: <GitBranch />,
      label: 'Word Hierarchy',
      exact: false
    },
    {
      href: '/grammar-graph',
      icon: <Workflow />,
      label: 'Grammar Graph',
      exact: false
    }
  ];

  const isItemActive = (item: NavItem) =>
    item.exact
      ? pathWithoutLocale === item.href
      : pathWithoutLocale === item.href ||
        pathWithoutLocale.startsWith(item.href + '/');

  const mobileItems: NavItem[] = [
    { href: '/', icon: <House />, label: 'Home', exact: true },
    { href: '/kanji', icon: '字', label: 'Kanji', exact: false },
    { href: '/vocabulary', icon: '語', label: 'Vocabulary', exact: false },
    { href: '/progress', icon: <TrendingUp />, label: 'Progress', exact: true }
  ];

  const mobileDrawerItems: NavItem[] = [
    {
      href: '/dictionary',
      icon: <BookOpen />,
      label: 'Dictionary',
      exact: true
    },
    { href: '/kanji-map', icon: <Network />, label: 'Kanji Map', exact: false },
    { href: '/quick-kanji', icon: <Zap />, label: 'Quick Kanji', exact: false },
    { href: '/radicals', icon: '部', label: 'Radicals', exact: false },
    {
      href: '/quick-vocab',
      icon: <Library />,
      label: 'Quick Vocab',
      exact: false
    },
    { href: '/kana', icon: 'あ', label: 'Kana', exact: false },
    {
      href: '/japanese/grammarlist',
      icon: <Languages />,
      label: 'Grammar',
      exact: false
    },
    { href: '/reading', icon: <FileText />, label: 'Reading', exact: false },
    {
      href: '/text-parser',
      icon: <ScanText />,
      label: 'Text Parser',
      exact: false
    },
    {
      href: '/achievements',
      icon: <Trophy />,
      label: 'Achievements',
      exact: true
    },
    {
      href: '/preferences',
      icon: <Sparkles />,
      label: 'Preferences',
      exact: true
    },
    ...experimentItems
  ];

  const isMobileDrawerActive = mobileDrawerItems.some(isItemActive);

  return (
    <>
      <aside
        id='main-sidebar'
        className={clsx(
          'flex flex-col h-screen sticky top-0 z-50',
          'bg-[var(--bg-color)] border-r border-[var(--border-color)]',
          'transition-all duration-300 ease-in-out',
          isExpanded ? 'w-56' : 'w-16',
          'max-lg:hidden',
          'pb-8'
        )}
      >
        <div
          className={clsx(
            'flex items-center py-5 border-b border-[var(--border-color)]',
            isExpanded ? 'px-4 gap-2' : 'px-2 justify-center'
          )}
        >
          {isExpanded && (
            <span className='text-2xl font-bold text-[var(--main-color)]'>
              KanTan
            </span>
          )}
          <span
            className={clsx(
              'text-[var(--secondary-color)]',
              isExpanded
                ? 'text-lg'
                : 'text-xl font-bold text-[var(--main-color)]'
            )}
          >
            簡単
          </span>
        </div>

        <nav className='flex-1 flex flex-col gap-0.5 py-4 px-2 overflow-y-auto'>
          {mainItems.map(item => (
            <NavItemComponent
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={isItemActive(item)}
              isExpanded={isExpanded}
              onClick={playClick}
            />
          ))}

          <div className={clsx('my-2', isExpanded ? 'mx-2' : 'mx-1')}>
            <div className='h-px bg-[var(--border-color)]' />
          </div>

          {experimentItems.map(item => (
            <NavItemComponent
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={isItemActive(item)}
              isExpanded={isExpanded}
              onClick={playClick}
            />
          ))}
        </nav>

        <button
          type='button'
          onClick={() => {
            playClick();
            toggleSidebar();
          }}
          className={clsx(
            'flex items-center justify-center gap-2 py-3',
            isExpanded && 'border-t border-[var(--border-color)]',
            'text-[var(--secondary-color)] hover:text-[var(--text-color)] hover:bg-[var(--card-color)]',
            'transition-colors duration-200'
          )}
        >
          {isExpanded ? (
            <>
              <ChevronLeft size={18} />
              <span className='text-sm'>閉</span>
            </>
          ) : (
            <span className='text-sm'>開</span>
          )}
        </button>
      </aside>

      <nav
        id='mobile-nav'
        className={clsx(
          'lg:hidden fixed bottom-0 left-0 right-0 z-50',
          'bg-[var(--card-color)] border-t-2 border-[var(--border-color)]',
          'grid grid-cols-5 items-center gap-1 py-1.5 px-2'
        )}
      >
        {mobileItems.map(item => (
          <MobileNavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            isActive={isItemActive(item)}
            onClick={playClick}
          />
        ))}
        <MobileMenuButton
          isActive={isMobileDrawerActive || isMobileMenuOpen}
          onClick={() => {
            playClick();
            setIsMobileMenuOpen(true);
          }}
        />
      </nav>

      <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <DrawerContent className='lg:hidden bg-[var(--background-color)] border-2 border-[var(--border-color)] rounded-t-3xl pb-6'>
          <DrawerHeader className='text-left px-5 pb-2'>
            <DrawerTitle className='text-xl text-[var(--main-color)]'>
              All features
            </DrawerTitle>
            <DrawerDescription className='text-sm text-[var(--secondary-color)]'>
              Jump to any learning tool.
            </DrawerDescription>
          </DrawerHeader>
          <div className='grid grid-cols-3 gap-2 px-4 pb-4 max-h-[65vh] overflow-y-auto'>
            {mobileDrawerItems.map(item => {
              const isActive = isItemActive(item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition-all duration-250',
                    isActive
                      ? 'border-[var(--main-color)] bg-[var(--card-color)] text-[var(--main-color)]'
                      : 'border-[var(--border-color)] bg-[var(--card-color)] text-[var(--secondary-color)] hover:text-[var(--main-color)]'
                  )}
                  onClick={() => {
                    playClick();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span className='text-2xl leading-none'>{item.icon}</span>
                  <span className='text-xs font-medium leading-tight'>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;
