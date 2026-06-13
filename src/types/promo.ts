/** Code promo d'un ambassadeur (-15 %). */
export interface PromoCode {
  code: string;
  ambassadorId: string;
  ambassadorName: string;
  percent: number;
  createdAt: string;
}

/** Utilisation d'un code par un utilisateur (attribution à l'ambassadeur). */
export interface PromoRedemption {
  id: string;
  code: string;
  userId: string;
  ambassadorId: string;
  createdAt: string;
}

export interface AmbassadorStats {
  uses: number;
  rewardEur: number;
}
