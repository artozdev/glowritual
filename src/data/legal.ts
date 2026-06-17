/**
 * Contenu des pages légales (Mentions légales, CGU, Confidentialité).
 * ⚠️ Modèles de base — à faire relire par un juriste avant un usage définitif
 * (l'app traite des images de visage = données sensibles + paiements).
 */

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  slug: string;
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}

const UPDATED = 'Dernière mise à jour : juin 2026';
const CONTACT_LINE =
  'Contact : glowritualio@gmail.com · WhatsApp : +33 6 02 00 55 29';

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  'mentions-legales': {
    slug: 'mentions-legales',
    title: 'Mentions légales',
    updated: UPDATED,
    sections: [
      {
        heading: 'Éditeur du site et de l’application',
        body: [
          'Le site et l’application Glow sont édités par Arthur Lorthois, entrepreneur individuel.',
          'Forme juridique : Entreprise individuelle',
          'SIRET : 104 040 456 00014',
          'Adresse : Confidentiel',
          'Email : glowritualio@gmail.com',
          'Directeur de la publication : Arthur Lorthois',
        ],
      },
      {
        heading: 'Hébergement',
        body: [
          'Le site et l’application sont hébergés par Vercel et Supabase.',
        ],
      },
      {
        heading: 'Propriété intellectuelle',
        body: [
          'L’ensemble des éléments composant le site et l’application Glow (marque, logo, textes, visuels, code, design, base de données) sont protégés par le droit de la propriété intellectuelle et demeurent la propriété exclusive de l’éditeur. Toute reproduction, représentation ou exploitation, totale ou partielle, sans autorisation préalable est interdite.',
        ],
      },
      {
        heading: 'Données personnelles',
        body: [
          'Le traitement des données personnelles est décrit dans notre Politique de Confidentialité. Conformément au RGPD, vous disposez de droits d’accès, de rectification et de suppression de vos données, exerçables à l’adresse : glowritualio@gmail.com. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).',
        ],
      },
      {
        heading: 'Cookies',
        body: [
          'Le site peut utiliser des cookies à des fins de fonctionnement et de mesure d’audience. Vous pouvez gérer vos préférences via le bandeau prévu à cet effet.',
        ],
      },
      {
        heading: 'Responsabilité',
        body: [
          'Glow est un service de bien-être et ne constitue pas un dispositif médical. Les recommandations fournies ne remplacent pas l’avis d’un dermatologue ou d’un professionnel de santé.',
        ],
      },
      {
        heading: 'Contact',
        body: ['Pour toute question : glowritualio@gmail.com · WhatsApp : +33 6 02 00 55 29'],
      },
    ],
  },

  cgu: {
    slug: 'cgu',
    title: 'Conditions Générales d’Utilisation',
    updated: UPDATED,
    sections: [
      {
        heading: '1. Objet',
        body: [
          'Les présentes Conditions Générales d’Utilisation régissent l’accès et l’utilisation de l’application Glow (ci-après « l’Application »), éditée par Glow. En utilisant l’Application, vous acceptez sans réserve les présentes CGU.',
        ],
      },
      {
        heading: '2. Description du service',
        body: [
          'Glow est une application de bien-être qui analyse le visage de l’utilisateur via la caméra de son appareil afin de proposer des recommandations de soins et de produits naturels, ainsi qu’une routine personnalisée. Glow est un outil de bien-être et de confort ; il ne constitue pas un dispositif médical et ne remplace en aucun cas l’avis d’un dermatologue ou d’un professionnel de santé.',
        ],
      },
      {
        heading: '3. Accès au service',
        body: [
          'L’Application propose une formule gratuite (incluant un scan) et des formules payantes par abonnement (mensuel et annuel). Les caractéristiques et tarifs sont présentés dans l’Application.',
        ],
      },
      {
        heading: '4. Compte utilisateur',
        body: [
          'La création d’un compte est nécessaire. L’utilisateur s’engage à fournir des informations exactes et à préserver la confidentialité de ses identifiants. Il est responsable de l’activité réalisée depuis son compte.',
        ],
      },
      {
        heading: '5. Abonnements et paiement',
        body: [
          'Les abonnements sont facturés selon la formule choisie (mensuelle ou annuelle). L’abonnement annuel est facturé en une fois pour la période concernée. Les paiements sont traités via notre prestataire de paiement sécurisé. Les abonnements sont sans engagement et résiliables à tout moment ; la résiliation prend effet à la fin de la période en cours.',
        ],
      },
      {
        heading: '6. Droit de rétractation',
        body: [
          'Conformément à la réglementation applicable, l’utilisateur dispose d’un droit de rétractation dans les conditions prévues par la loi, sauf renonciation expresse en cas d’accès immédiat au service numérique.',
        ],
      },
      {
        heading: '7. Utilisation acceptable',
        body: [
          'L’utilisateur s’engage à ne pas détourner l’Application, à n’y téléverser que ses propres images, et à ne pas l’utiliser à des fins illicites.',
        ],
      },
      {
        heading: '8. Propriété intellectuelle',
        body: [
          'L’ensemble des éléments de l’Application (marque, contenus, code, design) est protégé et demeure la propriété exclusive de Glow. Toute reproduction non autorisée est interdite.',
        ],
      },
      {
        heading: '9. Limitation de responsabilité',
        body: [
          'Les recommandations fournies par Glow sont de nature informative et fondées sur une analyse automatisée pouvant comporter des limites. Glow ne saurait être tenu responsable de réactions cutanées ou de résultats variables selon les personnes. Il est recommandé d’effectuer un test cutané avant toute nouvelle application de produit et de consulter un professionnel de santé en cas de doute.',
        ],
      },
      {
        heading: '10. Modification des CGU',
        body: [
          'Glow se réserve le droit de modifier les présentes CGU. Les utilisateurs seront informés de toute modification substantielle.',
        ],
      },
      {
        heading: '11. Droit applicable',
        body: [
          'Les présentes CGU sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents.',
          CONTACT_LINE,
        ],
      },
    ],
  },

  confidentialite: {
    slug: 'confidentialite',
    title: 'Politique de Confidentialité',
    updated: UPDATED,
    sections: [
      {
        heading: '1. Responsable du traitement',
        body: [
          'Glow, représentée par Arthur, fondateur, est responsable du traitement des données personnelles collectées via l’Application. Contact : glowritualio@gmail.com.',
        ],
      },
      {
        heading: '2. Données collectées',
        body: [
          'Nous collectons : les données de compte (email, prénom, données de profil renseignées à l’inscription et au questionnaire), les images de votre visage issues des scans, les données d’analyse générées, les données d’utilisation, et les données de paiement (traitées par notre prestataire de paiement, non stockées par nous).',
        ],
      },
      {
        heading: '3. Données sensibles — images du visage',
        body: [
          'Les photos de votre visage sont des données particulièrement sensibles. Elles sont utilisées uniquement pour réaliser l’analyse et le suivi de votre peau. Elles sont stockées de manière sécurisée et chiffrée, accessibles uniquement par vous. Une partie de l’analyse peut être réalisée directement sur votre appareil. Vous pouvez supprimer vos images et l’intégralité de vos données à tout moment.',
        ],
      },
      {
        heading: '4. Finalités',
        body: [
          'Vos données servent à : fournir l’analyse et les recommandations, créer et suivre votre routine, gérer votre compte et votre abonnement, améliorer le service, et assurer le support.',
        ],
      },
      {
        heading: '5. Base légale',
        body: [
          'Le traitement repose sur votre consentement (notamment pour les images du visage) et sur l’exécution du contrat (fourniture du service et de l’abonnement).',
        ],
      },
      {
        heading: '6. Partage des données',
        body: [
          'Vos données ne sont jamais vendues. Elles peuvent être partagées avec nos prestataires techniques strictement nécessaires (hébergement, paiement), soumis à des obligations de confidentialité.',
        ],
      },
      {
        heading: '7. Durée de conservation',
        body: [
          'Vos données sont conservées le temps de l’utilisation du service, puis supprimées dans un délai raisonnable après la fermeture de votre compte, sauf obligation légale de conservation.',
        ],
      },
      {
        heading: '8. Vos droits',
        body: [
          'Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition, de limitation et de portabilité de vos données, ainsi que du droit de retirer votre consentement à tout moment. Vous pouvez exercer ces droits à : glowritualio@gmail.com. Vous pouvez également saisir la CNIL (www.cnil.fr).',
        ],
      },
      {
        heading: '9. Sécurité',
        body: [
          'Nous mettons en œuvre des mesures techniques (chiffrement, accès restreint) pour protéger vos données.',
        ],
      },
      {
        heading: '10. Mineurs',
        body: [
          'L’Application s’adresse à un public majeur. Si vous êtes mineur, l’utilisation requiert l’accord d’un représentant légal, et un traitement adapté et renforcé est appliqué.',
        ],
      },
      {
        heading: '11. Modifications',
        body: [
          'Cette politique peut être mise à jour ; toute modification substantielle vous sera signalée.',
          CONTACT_LINE,
        ],
      },
    ],
  },
};

export const LEGAL_LINKS: { slug: string; label: string }[] = [
  { slug: 'mentions-legales', label: 'Mentions légales' },
  { slug: 'cgu', label: 'CGU' },
  { slug: 'confidentialite', label: 'Politique de Confidentialité' },
];
