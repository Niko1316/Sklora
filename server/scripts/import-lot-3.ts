import { config } from "dotenv";
// Load environment variables first
config();

import { getDb } from "../db";
import { modules, lessons } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

interface VocabulaireCle {
  terme: string;
  definition: string;
}

interface LeconData {
  numero: number;
  titre: string;
  module_target: number;
  objectifs_apprentissage: string[];
  prerequis: string[];
  vocabulaire_cle: VocabulaireCle[];
  xp_suggere: number;
  duree_minutes: number;
}

interface LotData {
  lot: number;
  lecons: LeconData[];
}

function generateMarkdownFromLesson(lecon: LeconData): string {
  let markdown = `# Leçon ${lecon.numero}: ${lecon.titre}\n\n`;

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

  markdown += `## Contenu principal\n\n`;
  markdown += `*Le contenu détaillé de cette leçon sera complété progressivement via l'interface admin.*\n\n`;

  markdown += `## Points clés à retenir\n\n`;
  markdown += `*À compléter*\n\n`;

  markdown += `## Exercice pratique\n\n`;
  markdown += `*À compléter*\n\n`;

  return markdown;
}

async function main() {
  console.log("🚀 Import du Lot 3 - Leçons 16 à 20\n");

  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  try {
    // Lire le fichier JSON
    const jsonPath = path.join(process.cwd(), "scripts", "lot-3-complete.json");
    const jsonContent = await fs.readFile(jsonPath, "utf-8");
    const lotData: LotData = JSON.parse(jsonContent);

    console.log(`📦 Traitement du lot ${lotData.lot} avec ${lotData.lecons.length} leçons\n`);

    // Récupérer tous les modules de la Phase 1
    const allModules = await db.select().from(modules);
    console.log(`📚 ${allModules.length} modules trouvés dans la base\n`);

    for (const lecon of lotData.lecons) {
      console.log(`\n📝 Traitement: Leçon ${lecon.numero} - ${lecon.titre}`);
      console.log(`   Module cible: ${lecon.module_target}`);

      // Trouver le module correspondant
      // Les modules sont organisés par order, le module_target correspond à l'orderIndex
      const targetModule = allModules.find(m => m.orderIndex === lecon.module_target);

      if (!targetModule) {
        console.error(`   ❌ Module ${lecon.module_target} non trouvé!`);
        continue;
      }

      console.log(`   ✅ Module trouvé: "${targetModule.title}" (ID: ${targetModule.id})`);

      // Vérifier si la leçon existe déjà
      const existingLessons = await db.select().from(lessons)
        .where(and(
          eq(lessons.moduleId, targetModule.id),
          eq(lessons.orderIndex, lecon.numero)
        ));

      const contentMarkdown = generateMarkdownFromLesson(lecon);

      const lessonData = {
        moduleId: targetModule.id,
        title: `Leçon ${lecon.numero}: ${lecon.titre}`,
        contentMarkdown,
        contentJson: JSON.stringify(lecon),
        objectifsApprentissage: JSON.stringify(lecon.objectifs_apprentissage),
        prerequis: JSON.stringify(lecon.prerequis),
        vocabulaireCle: JSON.stringify(lecon.vocabulaire_cle),
        duration: lecon.duree_minutes,
        xpReward: lecon.xp_suggere,
        orderIndex: lecon.numero,
        difficulty: "facile" as const,
        isPublished: true,
        isFree: false,
      };

      if (existingLessons.length > 0) {
        // Mettre à jour la leçon existante
        const existingLesson = existingLessons[0];
        console.log(`   ↻ Mise à jour de la leçon existante (ID: ${existingLesson.id})`);

        await db.update(lessons)
          .set({
            ...lessonData,
            updatedAt: new Date(),
          })
          .where(eq(lessons.id, existingLesson.id));

        console.log(`   ✅ Leçon ${lecon.numero} mise à jour avec succès`);
      } else {
        // Créer une nouvelle leçon
        console.log(`   + Création d'une nouvelle leçon`);

        const [result] = await db.insert(lessons).values({
          ...lessonData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(`   ✅ Leçon ${lecon.numero} créée avec succès (ID: ${result.insertId})`);
      }
    }

    console.log(`\n\n✨ Import terminé avec succès!`);
    console.log(`📊 Résumé: ${lotData.lecons.length} leçons traitées`);

  } catch (error) {
    console.error("❌ Erreur:", error);
    throw error;
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("💥 Erreur fatale:", error);
  process.exit(1);
});
