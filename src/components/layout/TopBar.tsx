import { NavLink, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { NAV_ITEMS } from '@/lib/navigation';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/**
 * Barre supérieure — logo centré.
 * Desktop : navigation à gauche, bouton Premium à droite.
 * Mobile : seul le logo centré (la navigation passe en bas).
 */
export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-beige-200/70 bg-cream/80 backdrop-blur-md">
      <div className="container-app grid h-16 grid-cols-[1fr_auto_1fr] items-center">
        {/* Navigation desktop (gauche) */}
        <nav className="col-start-1 hidden items-center gap-1 justify-self-start md:flex">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-2xl px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sage-50 text-sage-700'
                    : 'text-sage-500 hover:bg-sage-50 hover:text-sage-700',
                )
              }
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logo centré */}
        <Link
          to="/"
          aria-label="Accueil Glow"
          className="col-start-2 justify-self-center"
        >
          <Logo />
        </Link>

        {/* Premium (droite) */}
        <Link to="/pricing" className="col-start-3 hidden justify-self-end md:block">
          <Button size="sm" variant="secondary">
            <Sparkles className="h-4 w-4" />
            Premium
          </Button>
        </Link>
      </div>
    </header>
  );
}
