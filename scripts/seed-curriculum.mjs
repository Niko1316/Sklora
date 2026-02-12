/**
 * Seed script for Sklora curriculum
 * Creates 4 phases (parcours), 24 modules, and 120 lessons
 * Run with: node -e "require('dotenv').config(); require('child_process').execSync('node scripts/seed-curriculum.mjs', {stdio:'inherit', env: process.env})"
 */
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const CURRICULUM = [
  {
    phase: 1,
    title: "Fondamentaux Professionnels",
    description: "Maîtrisez les bases essentielles du métier de coiffeur : hygiène, anatomie capillaire, accueil client, outils professionnels, techniques de lavage et colorimétrie fondamentale.",
    difficulty: "debutant",
    modules: [
      { title: "Hygiène, salubrité et sécurité", description: "Apprenez les normes d'hygiène et de sécurité essentielles en salon de coiffure.", lessons: ["Normes sanitaires en salon de coiffure","Stérilisation et désinfection des outils","Gestion des déchets et produits chimiques","Ergonomie et prévention des TMS","Protocoles d'urgence et premiers soins"] },
      { title: "Anatomie et physiologie capillaire", description: "Comprenez la structure du cheveu et du cuir chevelu pour mieux servir vos clients.", lessons: ["Structure du cheveu : cortex, cuticule, médulla","Le cycle de vie du cheveu","Types de cheveux et porosité","Pathologies du cuir chevelu","Analyse capillaire professionnelle"] },
      { title: "Accueil client et consultation", description: "Développez vos compétences en communication et consultation client.", lessons: ["Techniques d'accueil professionnel","La consultation capillaire complète","Gestion des attentes client","Communication non-verbale en salon","Fidélisation et suivi client"] },
      { title: "Outils et équipements professionnels", description: "Maîtrisez l'utilisation et l'entretien de tous les outils du coiffeur.", lessons: ["Les ciseaux : types et techniques de coupe","Tondeuses et rasoirs professionnels","Brosses, peignes et accessoires","Appareils thermiques : sèche-cheveux, fers","Entretien et affûtage des outils"] },
      { title: "Techniques de lavage et soins", description: "Apprenez les techniques de lavage, massage et soins capillaires.", lessons: ["Le shampooing professionnel","Techniques de massage du cuir chevelu","Soins et traitements capillaires","Diagnostic et prescription de soins","Rituels de soins en salon"] },
      { title: "Colorimétrie fondamentale", description: "Initiez-vous aux bases de la colorimétrie et de la théorie des couleurs.", lessons: ["Le cercle chromatique et les couleurs primaires","Hauteur de ton et reflets","Nuancier professionnel : lecture et interprétation","Oxydants et temps de pause","Tests de mèche et précautions"] }
    ]
  },
  {
    phase: 2,
    title: "Techniques de Base",
    description: "Développez vos compétences techniques fondamentales : coupes homme et femme, coiffage, coloration, décoloration et traitements chimiques.",
    difficulty: "debutant",
    modules: [
      { title: "Coupe homme traditionnelle", description: "Maîtrisez les techniques de coupe masculine classique et moderne.", lessons: ["Les bases de la coupe homme","Dégradé classique et fondu","Coupe aux ciseaux vs tondeuse","Finitions et contours","Styles tendance homme"] },
      { title: "Coupe femme structurée", description: "Apprenez les techniques de coupe féminine structurée et géométrique.", lessons: ["Le carré : classique, plongeant, dégradé","Coupe en couches et effilage","La frange : types et techniques","Coupe courte femme","Adaptation de la coupe à la morphologie"] },
      { title: "Coiffage et brushing", description: "Perfectionnez vos techniques de coiffage et de mise en forme.", lessons: ["Brushing lisse professionnel","Brushing volume et mouvement","Techniques de bouclage au fer","Lissage temporaire","Produits de coiffage et finition"] },
      { title: "Coloration fondamentale", description: "Maîtrisez les techniques de coloration de base.", lessons: ["Coloration ton sur ton","Coloration d'oxydation permanente","Application racines et longueurs","Couverture des cheveux blancs","Entretien et ravivage de la couleur"] },
      { title: "Décoloration sécuritaire", description: "Apprenez les techniques de décoloration en toute sécurité.", lessons: ["Principes de la décoloration","Choix du produit et de l'oxydant","Techniques d'application sécuritaire","Surveillance et temps de pause","Soins post-décoloration"] },
      { title: "Permanente et défrisage", description: "Initiez-vous aux traitements chimiques de restructuration.", lessons: ["Principes chimiques de la permanente","Techniques d'enroulage","Le défrisage : techniques et précautions","Lissage brésilien et kératine","Diagnostic et contre-indications"] }
    ]
  },
  {
    phase: 3,
    title: "Techniques Avancées",
    description: "Perfectionnez votre art avec des techniques avancées : coiffure événementielle, extensions, techniques créatives et spécialités capillaires.",
    difficulty: "intermediaire",
    modules: [
      { title: "Coiffure événementielle", description: "Créez des coiffures élégantes pour les occasions spéciales.", lessons: ["Chignons classiques et modernes","Coiffures de mariée","Tresses et nattes décoratives","Accessoires et ornements capillaires","Coiffures de soirée et red carpet"] },
      { title: "Extensions et rallonges", description: "Maîtrisez les différentes techniques de pose d'extensions.", lessons: ["Types d'extensions : naturelles vs synthétiques","Pose à chaud (kératine)","Pose à froid (micro-anneaux, tissage)","Extensions à clips et tape-in","Entretien et dépose sécuritaire"] },
      { title: "Techniques créatives", description: "Explorez les techniques de coloration et coupe créatives.", lessons: ["Balayage et ombré hair","Mèches et highlights avancés","Coloration fantaisie et pastel","Techniques de razor cut","Coupe texturée et déstructurée"] },
      { title: "Spécialités capillaires", description: "Développez des compétences spécialisées pour différents types de cheveux.", lessons: ["Cheveux afro : soins et techniques","Cheveux bouclés : méthode curly girl","Cheveux fins : volume et densité","Cheveux épais : gestion et allègement","Cheveux abîmés : reconstruction"] },
      { title: "Correction et réparation", description: "Apprenez à corriger les erreurs de coloration et de coupe.", lessons: ["Correction de couleur : principes","Décapage et gomme de couleur","Rattrapage de décoloration ratée","Correction de coupe asymétrique","Gestion des situations de crise"] },
      { title: "Techniques homme avancées", description: "Perfectionnez les techniques de coiffure masculine avancées.", lessons: ["Dégradé skin fade et mid fade","Design et motifs à la tondeuse","Barbe : taille et entretien professionnel","Coloration homme et camouflage","Tendances et styles contemporains"] }
    ]
  },
  {
    phase: 4,
    title: "Gestion d'Entreprise et Perfectionnement",
    description: "Préparez-vous à gérer votre propre salon : gestion d'entreprise, marketing, formation, certifications et innovation.",
    difficulty: "avance",
    modules: [
      { title: "Gestion de salon", description: "Apprenez les bases de la gestion d'un salon de coiffure.", lessons: ["Business plan et création d'entreprise","Gestion financière et comptabilité","Gestion des stocks et fournisseurs","Logiciels de gestion de salon","Aspects juridiques et assurances"] },
      { title: "Marketing et développement", description: "Développez votre clientèle et votre présence en ligne.", lessons: ["Stratégie marketing pour salon","Réseaux sociaux et personal branding","Photographie de coiffure","Avis clients et e-réputation","Partenariats et événements"] },
      { title: "Formation et supervision", description: "Développez vos compétences de formateur et manager.", lessons: ["Pédagogie et transmission du savoir","Supervision d'apprentis","Gestion d'équipe en salon","Évaluation des compétences","Création de programmes de formation"] },
      { title: "Normes et certifications", description: "Préparez-vous aux certifications professionnelles.", lessons: ["DEP Coiffure (Québec)","Examen du Sceau Rouge (Canada)","CAP Métiers de la coiffure (France)","Bac Pro Métiers de la coiffure (France)","Certifications internationales"] },
      { title: "Innovation et tendances", description: "Restez à la pointe des nouvelles tendances et technologies.", lessons: ["Veille tendances et défilés","Nouvelles technologies en coiffure","Développement durable en salon","Produits bio et naturels","Intelligence artificielle et coiffure"] },
      { title: "Perfectionnement et carrière", description: "Planifiez votre carrière et continuez à vous perfectionner.", lessons: ["Portfolio professionnel","Concours et compétitions","Spécialisation et niche","Réseau professionnel et mentorat","Plan de carrière à long terme"] }
    ]
  }
];

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  console.log('🌱 Starting curriculum seed...');
  
  // Check if data already exists
  const [existing] = await connection.execute('SELECT COUNT(*) as cnt FROM parcours');
  if (existing[0].cnt > 0) {
    console.log(`⚠️  ${existing[0].cnt} parcours already exist. Skipping seed to avoid duplicates.`);
    console.log('   To re-seed, first run: DELETE FROM lessons; DELETE FROM modules; DELETE FROM parcours;');
    await connection.end();
    return;
  }
  
  let lessonCounter = 0;
  
  for (const phase of CURRICULUM) {
    const parcoursSlug = slugify(`phase-${phase.phase}-${phase.title}`);
    console.log(`\n📚 Creating Phase ${phase.phase}: ${phase.title}`);
    
    const [parcoursResult] = await connection.execute(
      `INSERT INTO parcours (slug, title, description, difficulty, isPublished, isActive, displayOrder, totalModules, totalHours, xpReward, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, true, true, ?, ?, ?, ?, NOW(), NOW())`,
      [
        parcoursSlug,
        `Phase ${phase.phase}: ${phase.title}`,
        phase.description,
        phase.difficulty,
        phase.phase,
        phase.modules.length,
        phase.modules.length * 5 * 15 / 60, // ~15 min per lesson
        phase.modules.length * 50
      ]
    );
    const parcoursId = parcoursResult.insertId;
    
    let moduleOrder = 0;
    for (const mod of phase.modules) {
      moduleOrder++;
      const globalModuleNum = (phase.phase - 1) * 6 + moduleOrder;
      console.log(`  📦 Module ${globalModuleNum}: ${mod.title}`);
      
      const [moduleResult] = await connection.execute(
        `INSERT INTO modules (parcoursId, title, description, orderIndex, isPublished, hours, xpReward, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, true, ?, ?, NOW(), NOW())`,
        [parcoursId, `Module ${globalModuleNum}: ${mod.title}`, mod.description, moduleOrder, mod.lessons.length * 15 / 60, 50]
      );
      const moduleId = moduleResult.insertId;
      
      let lessonOrder = 0;
      for (const lessonTitle of mod.lessons) {
        lessonOrder++;
        lessonCounter++;
        
        const contentMd = `# Leçon ${lessonCounter}: ${lessonTitle}

## Objectifs d'apprentissage

- Comprendre les concepts clés de cette leçon
- Appliquer les techniques présentées
- Évaluer vos compétences acquises

## Introduction

Bienvenue dans la leçon ${lessonCounter} : **${lessonTitle}**. Cette leçon fait partie du module "${mod.title}" de la phase "${phase.title}".

## Contenu

*Le contenu détaillé de cette leçon sera ajouté prochainement via l'import JSON ou la génération IA.*

## Points clés à retenir

1. Point clé 1
2. Point clé 2
3. Point clé 3

## Exercice pratique

Mettez en pratique ce que vous avez appris dans cette leçon.
`;
        
        await connection.execute(
          `INSERT INTO lessons (moduleId, title, contentMarkdown, orderIndex, xpReward, duration, isPublished, difficulty, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, true, 'facile', NOW(), NOW())`,
          [moduleId, `Leçon ${lessonCounter}: ${lessonTitle}`, contentMd, lessonOrder, 25, 15]
        );
      }
    }
  }
  
  console.log(`\n✅ Seed complete! Created:`);
  console.log(`   - ${CURRICULUM.length} parcours (phases)`);
  console.log(`   - ${CURRICULUM.reduce((acc, p) => acc + p.modules.length, 0)} modules`);
  console.log(`   - ${lessonCounter} leçons`);
  
  await connection.end();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
