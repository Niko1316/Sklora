import { config } from "dotenv";
// Load environment variables first
config();

import { getDb } from "../db";
import { modules, lessons } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

interface VocabulaireCle {
  terme: string;
  definition: string;
}

interface ExercicePratique {
  description: string;
  materiel_requis: string[];
  etapes: string[];
}

interface ContenuPrincipal {
  introduction: string;
  resume: string;
  exercice_pratique: ExercicePratique;
  pour_aller_plus_loin: string[];
}

interface LeconData {
  numero: number;
  titre: string;
  objectifs_apprentissage: string[];
  prerequis: string[];
  vocabulaire_cle: VocabulaireCle[];
  contenu_principal: ContenuPrincipal;
  xp_reward: number;
  duration: number;
}

interface LotData {
  lot: number;
  lecons: LeconData[];
}

function generateMarkdownFromLesson(lecon: LeconData): string {
  let markdown = `# Leçon ${lecon.numero}: ${lecon.titre}\n\n`;

  // Introduction
  if (lecon.contenu_principal.introduction) {
    markdown += `## Introduction\n\n`;
    markdown += `${lecon.contenu_principal.introduction}\n\n`;
  }

  // Objectifs d'apprentissage
  markdown += `## Objectifs d'apprentissage\n\n`;
  lecon.objectifs_apprentissage.forEach(obj => {
    markdown += `- ${obj}\n`;
  });
  markdown += `\n`;

  // Prérequis
  if (lecon.prerequis && lecon.prerequis.length > 0) {
    markdown += `## Prérequis\n\n`;
    lecon.prerequis.forEach(prereq => {
      markdown += `- ${prereq}\n`;
    });
    markdown += `\n`;
  }

  // Vocabulaire clé
  if (lecon.vocabulaire_cle && lecon.vocabulaire_cle.length > 0) {
    markdown += `## Vocabulaire clé\n\n`;
    lecon.vocabulaire_cle.forEach(vocab => {
      markdown += `### ${vocab.terme}\n\n`;
      markdown += `${vocab.definition}\n\n`;
    });
  }

  // Résumé
  if (lecon.contenu_principal.resume) {
    markdown += `## Résumé du contenu\n\n`;
    markdown += `${lecon.contenu_principal.resume}\n\n`;
  }

  // Exercice pratique
  if (lecon.contenu_principal.exercice_pratique) {
    const ex = lecon.contenu_principal.exercice_pratique;
    markdown += `## Exercice pratique\n\n`;
    markdown += `${ex.description}\n\n`;

    if (ex.materiel_requis && ex.materiel_requis.length > 0) {
      markdown += `### Matériel requis\n\n`;
      ex.materiel_requis.forEach(mat => {
        markdown += `- ${mat}\n`;
      });
      markdown += `\n`;
    }

    if (ex.etapes && ex.etapes.length > 0) {
      markdown += `### Étapes\n\n`;
      ex.etapes.forEach((etape, index) => {
        markdown += `${index + 1}. ${etape}\n`;
      });
      markdown += `\n`;
    }
  }

  // Pour aller plus loin
  if (lecon.contenu_principal.pour_aller_plus_loin && lecon.contenu_principal.pour_aller_plus_loin.length > 0) {
    markdown += `## Pour aller plus loin\n\n`;
    lecon.contenu_principal.pour_aller_plus_loin.forEach(resource => {
      markdown += `- ${resource}\n`;
    });
    markdown += `\n`;
  }

  return markdown;
}

async function main() {
  console.log("🚀 Import du Lot 6 - Leçons 31 à 35\n");

  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  try {
    // Lire le fichier JSON
    const jsonPath = path.join(process.cwd(), "scripts", "lot-6-complet.json");
    const jsonContent = await fs.readFile(jsonPath, "utf-8");
    const lotData: LotData = JSON.parse(jsonContent);

    console.log(`📦 Traitement du lot ${lotData.lot} avec ${lotData.lecons.length} leçons\n`);

    // Récupérer tous les modules
    const allModules = await db.select().from(modules);
    console.log(`📚 ${allModules.length} modules trouvés dans la base\n`);

    // For lot 6, we'll assign lessons to modules based on their number
    // Lessons 31-35 will be distributed across existing modules
    const moduleMapping: { [key: number]: number } = {
      31: 3, // Module 3 for lesson 31
      32: 3, // Module 3 for lesson 32
      33: 3, // Module 3 for lesson 33
      34: 4, // Module 4 for lesson 34
      35: 4, // Module 4 for lesson 35
    };

    for (const lecon of lotData.lecons) {
      console.log(`\n📝 Traitement: Leçon ${lecon.numero} - ${lecon.titre}`);

      const targetModuleOrderIndex = moduleMapping[lecon.numero];
      console.log(`   Module cible (orderIndex): ${targetModuleOrderIndex}`);

      const targetModule = allModules.find(m => m.orderIndex === targetModuleOrderIndex);

      if (!targetModule) {
        console.log(`   ⚠️  AVERTISSEMENT: Module orderIndex ${targetModuleOrderIndex} non trouvé, saut de cette leçon`);
        continue;
      }

      console.log(`   ✅ Module trouvé: "${targetModule.title}" (ID: ${targetModule.id})`);

      // Vérifier si la leçon existe déjà
      const existingLesson = await db.select().from(lessons)
        .where(eq(lessons.title, lecon.titre))
        .limit(1);

      if (existingLesson.length > 0) {
        console.log(`   ⏭️  Leçon "${lecon.titre}" existe déjà (ID: ${existingLesson[0].id})`);
        continue;
      }

      // Générer le markdown complet
      const contentMarkdown = generateMarkdownFromLesson(lecon);

      // Créer la leçon
      const lessonData = {
        moduleId: targetModule.id,
        title: lecon.titre,
        contentMarkdown,
        objectifs: lecon.objectifs_apprentissage,
        prerequis: lecon.prerequis,
        vocabulaireCle: lecon.vocabulaire_cle,
        duration: lecon.duration,
        xpReward: lecon.xp_reward,
        difficulty: "moyen" as const,
        orderIndex: lecon.numero - 31, // 0-4 for lessons 31-35 within their module
        isFree: false,
        isPublished: true,
      };

      const result = await db.insert(lessons).values(lessonData);
      const newLessonId = result[0].insertId;

      console.log(`   ✅ Leçon créée avec ID: ${newLessonId}`);
      console.log(`      - Durée: ${lecon.duration} min`);
      console.log(`      - XP: ${lecon.xp_reward}`);
      console.log(`      - Objectifs: ${lecon.objectifs_apprentissage.length}`);
      console.log(`      - Vocabulaire: ${lecon.vocabulaire_cle.length} termes`);
    }

    console.log(`\n✅ Import du lot ${lotData.lot} terminé avec succès!\n`);

  } catch (error) {
    console.error("\n❌ Erreur lors de l'import:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
