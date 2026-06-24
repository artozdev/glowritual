import { useState } from 'react';
import { AVATARS } from './media';

function Avatar({ src }: { src: string }) {
  const [error, setError] = useState(false);
  return (
    <span className="inline-block h-7 w-7 overflow-hidden rounded-full bg-neutral-200 ring-2 ring-white">
      {!error && (
        <img
          src={src}
          alt=""
          onError={() => setError(true)}
          className="h-full w-full object-cover grayscale"
        />
      )}
    </span>
  );
}

/** Pile d'avatars qui se chevauchent (preuve sociale du hero). */
export function AvatarStack() {
  return (
    <span className="flex -space-x-2.5">
      {AVATARS.map((src) => (
        <Avatar key={src} src={src} />
      ))}
    </span>
  );
}
