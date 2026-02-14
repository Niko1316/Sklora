import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as db from '../db';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Lecon {
  numero: number;
  titre: string;
  objectifs_apprentissage: string[];
  prerequis: string[];
  vocabulaire_cle: Array<{
    terme: string;
    definition: string;
  }>;
  dureeMinutes: number;
  xpRecompense: number;
  isFree: boolean;
  isPublished: boolean;
}

interface LotData {
  lot: number;
  moduleId: number;
  lecons: Lecon[];
}

async function main() {
  console.log('🚀 Import du Lot 4 - Leçons 21 à 25\n');

  try {
    // Read JSON file
    const jsonPath = join(__dirname, '../../scripts/lot-4-complet.json');
    const jsonData = readFileSync(jsonPath, 'utf-8');
    const lotData: LotData = JSON.parse(jsonData);

    console.log(`📚 Lot ${lotData.lot} - ${lotData.lecons.length} leçons à importer\n`);

    // Get Module ID from DB
    const modules = await db.getModulesByParcours(1); // Assuming parcours ID 1
    if (!modules || modules.length < lotData.moduleId) {
      throw new Error(`Module ${lotData.moduleId} not found`);
    }
    const module = modules[lotData.moduleId - 1]; // 0-indexed

    console.log(`📦 Module cible: "${module.title}" (ID: ${module.id})\n`);

    // Import each lesson
    for (const lecon of lotData.lecons) {
      console.log(`\n📝 Leçon ${lecon.numero}: ${lecon.titre}`);

      // Prepare lesson data
      const lessonData = {
        moduleId: module.id,
        title: lecon.titre,
        description: lecon.objectifs_apprentissage.join('\n\n'),
        contentMarkdown: generateMarkdownContent(lecon),
        orderIndex: lecon.numero,
        dureeMinutes: lecon.dureeMinutes,
        xpRecompense: lecon.xpRecompense,
        isFree: lecon.isFree,
        isPublished: lecon.isPublished,
      };

      try {
        const result = await db.createLesson(lessonData);
        console.log(`   ✅ Leçon créée avec ID ${result.id}`);
        console.log(`   📖 ${lecon.dureeMinutes} min · ${lecon.xpRecompense} XP`);
      } catch (error: any) {
        if (error.message?.includes('Duplicate entry')) {
          console.log(`   ⚠️  Leçon déjà existante (ignorée)`);
        } else {
          throw error;
        }
      }
    }

    console.log(`\n\n✨ Import terminé avec succès !`);
    console.log(`📊 ${lotData.lecons.length} leçons du Lot ${lotData.lot} importées`);

  } catch (error) {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
  }
}

function generateMarkdownContent(lecon: Lecon): string {
  let markdown = `# ${lecon.titre}\n\n`;

  // Objectifs
  markdown += `## Objectifs d'apprentissage\n\n`;
  lecon.objectifs_apprentissage.forEach(obj => {
    markdown += `- ${obj}\n`;
  });
  markdown += '\n';

  // Prérequis
  if (lecon.prerequis.length > 0) {
    markdown += `## Prérequis\n\n`;
    lecon.prerequis.forEach(pre => {
      markdown += `- ${pre}\n`;
    });
    markdown += '\n';
  }

  // Vocabulaire clé
  markdown += `## Vocabulaire clé\n\n`;
  lecon.vocabulaire_cle.forEach(voc => {
    markdown += `### ${voc.terme}\n\n`;
    markdown += `${voc.definition}\n\n`;
  });

  // Content placeholder
  markdown += `## Contenu principal\n\n`;
  markdown += `_Le contenu complet de cette leçon sera ajouté prochainement. Cette leçon fait partie du programme de formation professionnelle en coiffure québécoise._\n\n`;

  // Footer
  markdown += `---\n\n`;
  markdown += `**Durée estimée:** ${lecon.dureeMinutes} minutes\n\n`;
  markdown += `**Récompense XP:** ${lecon.xpRecompense} XP\n`;

  return markdown;
}

main();
