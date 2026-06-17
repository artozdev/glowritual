import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { LEGAL_DOCS, LEGAL_LINKS } from '@/data/legal';

/** Transforme emails et URLs en liens cliquables dans un paragraphe. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(\S+@\S+\.\S+|https?:\/\/\S+|www\.\S+)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (/^\S+@\S+\.\S+$/.test(p))
          return (
            <a key={i} href={`mailto:${p}`} className="font-medium text-forest-light underline-offset-2 hover:underline">
              {p}
            </a>
          );
        if (/^(https?:\/\/|www\.)/.test(p))
          return (
            <a
              key={i}
              href={p.startsWith('http') ? p : `https://${p}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-forest-light underline-offset-2 hover:underline"
            >
              {p}
            </a>
          );
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

export default function Legal() {
  const { doc } = useParams<{ doc: string }>();
  const document = doc ? LEGAL_DOCS[doc] : undefined;

  if (!document) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-white text-forest">
      {/* En-tête */}
      <header className="sticky top-0 z-40 border-b border-forest/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5 sm:px-6">
          <Link to="/" aria-label="Accueil Glow">
            <Logo />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-forest/70 transition-colors hover:text-forest"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-forest sm:text-4xl">
          {document.title}
        </h1>
        <p className="mt-2 text-sm text-forest/50">{document.updated}</p>

        <div className="mt-10 space-y-9">
          {document.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-lg font-bold text-forest">{s.heading}</h2>
              <div className="mt-2 space-y-2">
                {s.body.map((p, i) => (
                  <p key={i} className="text-[15px] leading-relaxed text-forest/75">
                    <Linkified text={p} />
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Avertissement bien-être */}
        <div className="mt-12 flex items-start gap-2.5 rounded-2xl bg-sand px-4 py-3.5 text-sm text-forest/70">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-light" />
          Glow ne remplace pas l’avis d’un dermatologue ou d’un professionnel de
          santé.
        </div>

        {/* Liens entre pages légales */}
        <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-forest/10 pt-6 text-sm">
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.slug}
              to={`/legal/${l.slug}`}
              className={
                l.slug === doc
                  ? 'font-semibold text-forest'
                  : 'text-forest/60 transition-colors hover:text-forest'
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
