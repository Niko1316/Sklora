import { getDb } from "../db";
import { parcours, modules, lessons } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🚀 Début de l'import de la structure pour les leçons...\n");

  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  try {
    // 1. Créer le Parcours Phase 1
    console.log("📚 Création du parcours Phase 1...");

    const [existingParcours] = await db.select().from(parcours)
      .where(eq(parcours.slug, "phase-1-fondamentaux-professionnels"))
      .limit(1);

    let parcoursId: number;

    if (existingParcours) {
      console.log(`✅ Parcours existant: ${existingParcours.title} (ID: ${existingParcours.id})`);
      parcoursId = existingParcours.id;
    } else {
      const [result] = await db.insert(parcours).values({
        slug: "phase-1-fondamentaux-professionnels",
        title: "Phase 1 : Fondamentaux professionnels",
        description: "Formation de base en hygiène, anatomie, outils et techniques essentielles de la coiffure professionnelle québécoise. Conforme aux normes Emploi-Québec, CNESST, Sceau Rouge.",
        totalModules: 6,
        totalHours: 180,
        difficulty: "debutant",
        isActive: true,
        isPublished: true,
        isFree: true,
        displayOrder: 1,
        xpReward: 500,
      });
      parcoursId = result.insertId;
      console.log(`✅ Parcours créé (ID: ${parcoursId})`);
    }

    // 2. Créer Module 1: Hygiène, salubrité et sécurité
    console.log("\n📖 Création Module 1...");

    const [existingModule1] = await db.select().from(modules)
      .where(eq(modules.code, "MOD-384364"))
      .limit(1);

    let module1Id: number;

    if (existingModule1) {
      console.log(`✅ Module 1 existant (ID: ${existingModule1.id})`);
      module1Id = existingModule1.id;
    } else {
      const [result] = await db.insert(modules).values({
        parcoursId,
        code: "MOD-384364",
        title: "Module 1: Hygiène, salubrité et sécurité",
        description: "Compétence DEP: 384364 | Sceau Rouge: SR-101 | CAP France: U1 | BAC France: UG1",
        hours: 30,
        xpReward: 100,
        orderIndex: 1,
        isFree: true,
        isPublished: true,
      });
      module1Id = result.insertId;
      console.log(`✅ Module 1 créé (ID: ${module1Id})`);
    }

    // 3. Créer Module 3: Accueil client et consultation
    console.log("\n📖 Création Module 3...");

    const [existingModule3] = await db.select().from(modules)
      .where(eq(modules.code, "MOD-384366"))
      .limit(1);

    let module3Id: number;

    if (existingModule3) {
      console.log(`✅ Module 3 existant (ID: ${existingModule3.id})`);
      module3Id = existingModule3.id;
    } else {
      const [result] = await db.insert(modules).values({
        parcoursId,
        code: "MOD-384366",
        title: "Module 3: Accueil client et consultation",
        description: "Compétence DEP: 384366 | Sceau Rouge: SR-103 | CAP France: U3 | BAC France: UG3",
        hours: 30,
        xpReward: 100,
        orderIndex: 3,
        isFree: true,
        isPublished: true,
      });
      module3Id = result.insertId;
      console.log(`✅ Module 3 créé (ID: ${module3Id})`);
    }

    console.log("\n✨ Structure de base créée avec succès!");
    console.log(`\n📊 Résumé:`);
    console.log(`   - Parcours ID: ${parcoursId}`);
    console.log(`   - Module 1 ID: ${module1Id}`);
    console.log(`   - Module 3 ID: ${module3Id}`);
    console.log(`\nℹ️  Les leçons peuvent maintenant être importées via l'interface admin.`);

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
