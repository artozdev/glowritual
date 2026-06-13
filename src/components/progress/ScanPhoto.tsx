import { ScanFace } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoredScan } from '@/types/domain';

/** Photo d'un scan, avec repli élégant si aucune image n'est conservée. */
export function ScanPhoto({
  scan,
  className,
}: {
  scan: StoredScan;
  className?: string;
}) {
  if (scan.image) {
    return (
      <img
        src={scan.image}
        alt={`Scan du ${new Date(scan.createdAt).toLocaleDateString('fr-FR')}`}
        className={cn('object-cover', className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gradient-to-br from-sage-100 to-beige-100',
        className,
      )}
    >
      <ScanFace className="h-1/3 w-1/3 text-sage-300" strokeWidth={1} />
    </div>
  );
}
