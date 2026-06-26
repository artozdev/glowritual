import { Link } from 'react-router-dom';
import { Bot, Sparkles, Leaf, ScanFace } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const PREVIEW = [
  'Que faire pour mes cernes au naturel ?',
  'Comment intégrer le gua sha à ma routine ?',
  'Quel ordre pour mes soins du matin ?',
];

/**
 * Assistant Glow — placeholder « Bientôt ». Le vrai coach IA (réponses
 * personnalisées à partir de l'analyse) sera branché ultérieurement.
 */
export default function Assistant() {
  return (
    <div className="mx-auto max-w-2xl py-4">
      <Card className="flex flex-col items-center gap-3 p-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sage-gradient shadow-soft">
          <Bot className="h-8 w-8 text-sage-600" />
        </span>
        <Badge tone="sage">
          <Sparkles className="h-3 w-3" />
          Bientôt disponible
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-sage-900">
          Ton assistant Glow
        </h1>
        <p className="max-w-md text-sage-600">
          Bientôt, ton coach soin personnel : pose tes questions sur ta routine,
          tes produits et tes gestes, et reçois des réponses bienveillantes,
          adaptées à ton analyse.
        </p>

        <div className="mt-2 w-full max-w-sm space-y-2 text-left">
          {PREVIEW.map((q) => (
            <div
              key={q}
              className="flex items-center gap-2 rounded-2xl border border-beige-200 bg-white px-3.5 py-2.5 text-sm text-sage-600"
            >
              <Leaf className="h-4 w-4 shrink-0 text-sage-400" />
              {q}
            </div>
          ))}
        </div>

        <Link to="/results" className="mt-3">
          <Button variant="outline">
            <ScanFace className="h-4 w-4" />
            En attendant, voir mon Glow Plan
          </Button>
        </Link>
      </Card>
    </div>
  );
}
