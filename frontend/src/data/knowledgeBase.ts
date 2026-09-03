export interface GuideItem {
  id: string;
  title: string;
  summary: string;
  steps: string[];
  notice?: string;
}

export const GUIDE_SECTIONS: {
  selfService: GuideItem[];
  interventionRequise: GuideItem[];
} = {
  // SECTION 1 : SOLUTIONS RAPIDES EN AUTONOMIE
  selfService: [
    {
      id: 'app-repas-scan',
      title: 'Application Repas : Difficultés de scan du QR Code ou Badge',
      summary: 'Si le lecteur n’arrive pas à lire votre QR Code de commande repas.',
      steps: [
        'Augmenter la luminosité de l’écran de votre smartphone au maximum.',
        'Nettoyer la lentille de l’appareil photo ou du lecteur de la borne.',
        'Tenir votre téléphone à environ 15 cm sans bouger pendant 2 secondes.',
        'En cas d’échec, saisir manuellement votre code repas à 4 chiffres sur l’écran.'
      ],
      notice: 'La saisie manuelle permet de finaliser la commande sans bloquer le service.'
    },
    {
      id: 'app-repas-bug',
      title: 'Application Repas : Écran blanc ou blocage de commande',
      summary: 'Si l’application reste figée ou n’actualise pas votre commande.',
      steps: [
        'Fermer complètement l’application (ou forcer l’arrêt sur mobile).',
        'Sur navigateur web : effectuer un rafraîchissement complet via Ctrl + F5 (ou Cmd + Shift + R).',
        'Vérifier dans l’onglet « Historique » si la commande a déjà été validée avant de la ressaisir.'
      ]
    },
    {
      id: 'double-ecran',
      title: 'Double écran : Deuxième écran non détecté',
      summary: 'Si votre écran secondaire reste en veille ou affiche « Pas de signal ».',
      steps: [
        'Appuyer simultanément sur les touches Windows + P et choisir « Étendre ».',
        'Débrancher le câble HDMI ou USB-C, patienter 5 secondes, puis le rebrancher fermement.',
        'Vérifier que le bouton d’alimentation situé sous l’écran est allumé.'
      ]
    },
    {
      id: 'wifi-vpn',
      title: 'Connexion : Déconnexion Wi-Fi ou VPN entreprise',
      summary: 'En cas de perte d’accès aux serveurs internes.',
      steps: [
        'Désactiver puis réactiver le Wi-Fi depuis la barre des tâches.',
        'En télétravail : déconnecter le client VPN, attendre 10 secondes et vous reconnecter.',
        'Vérifier que vous êtes connecté au réseau officiel de l’entreprise et non au réseau Invité.'
      ]
    },
    {
      id: 'visio-audio',
      title: 'Visioconférence : Micro ou son coupé sur Teams / Meet',
      summary: 'Si vos collègues ne vous entendent pas lors d’une réunion.',
      steps: [
        'Vérifier la sélection du bon périphérique audio dans les paramètres de l’application.',
        'Vérifier que le bouton physique « Mute » de votre casque n’est pas enclenché.',
        'Sous Windows : ouvrir les « Paramètres de son » et vérifier que l’accès au micro est activé.'
      ]
    }
  ],

  // SECTION 2 : PANNES MAJEURES & DEMANDES DE MATÉRIEL
  interventionRequise: [
    {
      id: 'changement-ordinateur',
      title: 'Demande de nouvel ordinateur ou renouvellement de poste',
      summary: 'Procédure pour le remplacement de votre machine de travail ou un nouveau besoin matériel.',
      steps: [
        'Sauvegarder vos fichiers importants sur OneDrive ou sur vos dépôts Git.',
        'Créer un ticket avec l’objet « Demande de nouvel ordinateur » en précisant vos besoins logiciels (développement, bureautique).',
        'Le support informatique configure la machine avec votre profil et vous informe dès que le poste est prêt.'
      ],
      notice: 'Délai standard de préparation : 48 heures ouvrées.'
    },
    {
      id: 'borne-cantine-hs',
      title: 'Borne physique ou douchette de cantine hors-service',
      summary: 'Si la borne de scan physique de la cantine est éteinte ou le lecteur défectueux.',
      steps: [
        'Vérifier que le câble d’alimentation de la borne est bien branché.',
        'Créer une demande d’intervention en précisant la localisation « Espace Cantine ».',
        'Un technicien intervient sur place pour le redémarrage ou le remplacement du lecteur.'
      ]
    },
    {
      id: 'panne-materielle-pc',
      title: 'Panne matérielle : Batterie anormale, écran cassé, chargeur défaillant',
      summary: 'En cas de dommage physique ou problème électrique sur votre matériel.',
      steps: [
        'Par précaution : débrancher tout matériel dont la batterie chauffe anormalement.',
        'Créer un ticket pour échange standard auprès du support informatique.',
        'Déposer le matériel défaillant au bureau IT après validation de la demande.'
      ]
    },
    {
      id: 'services-generaux-clim-badge',
      title: 'Services Généraux : Climatisation, électricité ou badge d’accès',
      summary: 'Pour les problèmes d’infrastructure dans les bureaux ou en salle serveurs.',
      steps: [
        'Badge d’accès inactif : transmettre le numéro de série inscrit au dos de votre carte.',
        'Panne de climatisation ou électricité : créer un ticket en précisant le numéro de bureau.',
        'L’équipe des Services Généraux prendra en charge l’intervention sur site.'
      ]
    }
  ]
};
