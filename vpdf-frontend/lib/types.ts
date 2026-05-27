export interface Client {
    noClient: number;
    nomClient: string;
    noTelephone: string;
    dateCreation?: string;
  }
  
  export interface Article {
    noArticle: number;
    description: string;
    prixUnitaire: number;
    quantiteEnStock: number;
    categorie?: string;
    dateCreation?: string;
  }
  
  export interface Commande {
    noCommande: number;
    dateCommande: string;
    noClient: number;
    nomClient: string;
    statut: "EN_ATTENTE" | "CONFIRMEE" | "LIVREE" | "ANNULEE";
    montantTotal: number;
  }
  
  export interface LigneCommande {
    id: { noCommande: number; noArticle: number };
    quantite: number;
    description: string;
    prixUnitaire: number;
    sousTotal: number;
  }
  
  export interface CommandeDetail {
    commande: Commande;
    lignes: LigneCommande[];
  }
  
  export interface Livraison {
    noLivraison: number;
    dateLivraison: string;
    statut: "PLANIFIEE" | "EN_COURS" | "LIVREE";
  }
  
  export interface DetailLivraison {
    id: { noLivraison: number; noCommande: number; noArticle: number };
    quantiteLivree: number;
    description: string;
  }
  
  export interface LivraisonDetail {
    livraison: Livraison;
    details: DetailLivraison[];
  }
  
  export interface DashboardStats {
    totalClients: number;
    totalArticles: number;
    totalCommandes: number;
    totalLivraisons: number;
    chiffreAffaires: number;
    revenueParMois: { mois: string; montant: number; nbCommandes: number }[];
    topArticles: { noArticle: number; description: string; quantiteVendue: number; chiffreAffaires: number }[];
  }