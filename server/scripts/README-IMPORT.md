# Import des Leçons - Sklora

## Structure créée

Ce projet contient la structure pour importer **120 leçons** de formation professionnelle en coiffure québécoise réparties en:

- **4 Phases** de formation
- **24 Modules** thématiques
- **120 Leçons** complètes avec contenu structuré

## Données disponibles

### Lot 1 (Leçons 1-7) ✅
Les premières leçons complètes sont disponibles avec:
- Objectifs d'apprentissage
- Prérequis
- Vocabulaire clé
- Contenu principal détaillé
- Résumés
- Exercices pratiques
- Ressources complémentaires
- XP suggéré

## Comment importer

### Méthode 1: Script d'import

```bash
# Assurez-vous que DATABASE_URL est configuré
export DATABASE_URL="mysql://user:password@localhost:3306/sklora"

# Exécutez le script
npx tsx server/scripts/import-lessons.ts
```

### Méthode 2: Interface Admin

1. Connectez-vous à l'interface admin de Sklora
2. Naviguez vers "Gestion des leçons"
3. Utilisez la fonction "Import JSON"
4. Collez le contenu des fichiers JSON

## Structure des données

Chaque leçon contient:

```typescript
{
  numero: number;
  titre: string;
  objectifs_apprentissage: string[];
  prerequis: string[];
  vocabulaire_cle: Array<{
    terme: string;
    definition: string;
  }>;
  contenu_principal: {
    introduction: string;
    sections: Array<{
      titre: string;
      contenu_markdown: string;
      points_cles?: string[];
      exemple_pratique?: string;
    }>;
  };
  resume: string;
  exercice_pratique: {
    description: string;
    materiel_requis: string[];
    etapes: string[];
  };
  pour_aller_plus_loin: string[];
  xp_suggere: number;
}
```

## Prochaines étapes

1. ✅ Structure de base (parcours, modules) créée
2. ⏳ Import des 7 premières leçons
3. ⏳ Import des leçons 8-30 (Phase 1 complète)
4. ⏳ Import des leçons 31-60 (Phase 2)
5. ⏳ Import des leçons 61-90 (Phase 3)
6. ⏳ Import des leçons 91-120 (Phase 4)

## Notes

- Les données JSON complètes seront fournies par lots
- Chaque leçon est conforme aux normes québécoises (Emploi-Québec, CNESST, Sceau Rouge)
- Le contenu est adapté au climat et à la réalité culturelle du Québec
