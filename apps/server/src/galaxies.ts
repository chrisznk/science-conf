export type Galaxy = {
  id: string
  name: string
  commonName: string | null
  type: 'spiral' | 'elliptical' | 'irregular' | 'lenticular'
  distanceMly: number
  constellation: string
  description: string
  isRare: boolean
  rareLabel: string | null
}

export const GALAXIES: Galaxy[] = [
  { id: 'g001', name: 'NGC 224', commonName: 'Andromède', type: 'spiral', distanceMly: 2.537, constellation: 'Andromède', description: 'La plus grande galaxie du Groupe local, visible à l\'œil nu par nuit claire.', isRare: true, rareLabel: 'Notre plus proche grande voisine' },
  { id: 'g002', name: 'NGC 5457', commonName: 'Le Moulinet', type: 'spiral', distanceMly: 20.9, constellation: 'Grande Ourse', description: 'Une spirale presque parfaite, vue de face, révélant ses bras en détail.', isRare: false, rareLabel: null },
  { id: 'g003', name: 'NGC 4594', commonName: 'Le Sombrero', type: 'lenticular', distanceMly: 29.3, constellation: 'Vierge', description: 'Un disque de poussière spectaculaire ceinture cette galaxie, lui donnant l\'allure d\'un chapeau.', isRare: true, rareLabel: 'L\'une des plus photographiées' },
  { id: 'g004', name: 'NGC 1300', commonName: null, type: 'spiral', distanceMly: 61.3, constellation: 'Éridan', description: 'Une spirale barrée d\'une symétrie saisissante, photographiée par Hubble en 2005.', isRare: false, rareLabel: null },
  { id: 'g005', name: 'NGC 4414', commonName: null, type: 'spiral', distanceMly: 62, constellation: 'Chevelure de Bérénice', description: 'Spirale floculente dont les bras ne suivent aucun patron géométrique régulier.', isRare: false, rareLabel: null },
  { id: 'g006', name: 'NGC 1365', commonName: null, type: 'spiral', distanceMly: 56, constellation: 'Fourneau', description: 'Spirale barrée géante, abritant un trou noir supermassif parmi les plus étudiés.', isRare: false, rareLabel: null },
  { id: 'g007', name: 'NGC 4038/4039', commonName: 'Les Antennes', type: 'irregular', distanceMly: 45, constellation: 'Corbeau', description: 'Deux galaxies en collision, leurs queues de marée dessinant des antennes dans le vide.', isRare: true, rareLabel: 'Deux galaxies qui fusionnent' },
  { id: 'g008', name: 'NGC 1316', commonName: 'Fornax A', type: 'lenticular', distanceMly: 62, constellation: 'Fourneau', description: 'Résultat d\'une fusion ancienne, elle abrite encore les fantômes de galaxies absorbées.', isRare: false, rareLabel: null },
  { id: 'g009', name: 'NGC 5194', commonName: 'Le Tourbillon', type: 'spiral', distanceMly: 23.2, constellation: 'Chiens de Chasse', description: 'Première galaxie dont la structure spirale fut reconnue, par Lord Rosse en 1845.', isRare: true, rareLabel: 'Première spirale identifiée' },
  { id: 'g010', name: 'NGC 1275', commonName: 'Perseus A', type: 'elliptical', distanceMly: 237, constellation: 'Persée', description: 'Au cœur de l\'amas de Persée, elle émet un son — le si bémol le plus grave jamais mesuré.', isRare: true, rareLabel: 'La galaxie qui chante' },
  { id: 'g011', name: 'NGC 4486', commonName: 'M87', type: 'elliptical', distanceMly: 53.5, constellation: 'Vierge', description: 'C\'est son trou noir central qui fut la première ombre jamais photographiée, en 2019.', isRare: true, rareLabel: 'Premier trou noir photographié' },
  { id: 'g012', name: 'NGC 598', commonName: 'Triangulum', type: 'spiral', distanceMly: 2.73, constellation: 'Triangle', description: 'Troisième plus grande galaxie du Groupe local, elle tourne en orbite autour d\'Andromède.', isRare: false, rareLabel: null },
  { id: 'g013', name: 'NGC 3031', commonName: 'Bode', type: 'spiral', distanceMly: 11.8, constellation: 'Grande Ourse', description: 'Découverte en 1774 par Bode, c\'est l\'une des spirales les plus brillantes du ciel boréal.', isRare: false, rareLabel: null },
  { id: 'g014', name: 'NGC 3034', commonName: 'Le Cigare', type: 'irregular', distanceMly: 11.5, constellation: 'Grande Ourse', description: 'Galaxie en sursaut d\'étoiles, soufflant des jets de gaz rouge dans l\'espace intergalactique.', isRare: false, rareLabel: null },
  { id: 'g015', name: 'NGC 6822', commonName: 'Barnard', type: 'irregular', distanceMly: 1.63, constellation: 'Sagittaire', description: 'Galaxie naine irrégulière du Groupe local, laboratoire d\'étude de la formation stellaire.', isRare: false, rareLabel: null },
  { id: 'g016', name: 'NGC 4565', commonName: 'L\'Aiguille', type: 'spiral', distanceMly: 42.7, constellation: 'Chevelure de Bérénice', description: 'Vue exactement par la tranche, son disque fin comme une lame traverse le champ noir.', isRare: true, rareLabel: 'Galaxie vue par la tranche' },
  { id: 'g017', name: 'NGC 2207', commonName: null, type: 'spiral', distanceMly: 114, constellation: 'Grand Chien', description: 'Deux spirales imbriquées, produisant des supernovæ à un rythme effréné.', isRare: false, rareLabel: null },
  { id: 'g018', name: 'NGC 1427A', commonName: null, type: 'irregular', distanceMly: 52, constellation: 'Fourneau', description: 'Galaxie naine en chute libre vers le cœur de l\'amas du Fourneau, déformée par la gravité.', isRare: false, rareLabel: null },
  { id: 'g019', name: 'NGC 2841', commonName: null, type: 'spiral', distanceMly: 46, constellation: 'Grande Ourse', description: 'Spirale serrée aux bras si fins qu\'ils semblent peints au pinceau sur le vide.', isRare: false, rareLabel: null },
  { id: 'g020', name: 'NGC 7331', commonName: null, type: 'spiral', distanceMly: 40, constellation: 'Pégase', description: 'Souvent appelée le double de la Voie lactée pour sa taille et sa structure similaires.', isRare: false, rareLabel: null },
]

// Generate additional galaxies to reach 500+
const CONSTELLATIONS = ['Andromède', 'Grande Ourse', 'Vierge', 'Lion', 'Persée', 'Cassiopée', 'Orion', 'Sagittaire', 'Scorpion', 'Cygne', 'Pégase', 'Centaure', 'Fourneau', 'Éridan', 'Baleine', 'Corbeau', 'Lyre', 'Dragon', 'Bouvier', 'Serpent']
const TYPES: Galaxy['type'][] = ['spiral', 'elliptical', 'irregular', 'lenticular']

for (let i = 21; i <= 550; i++) {
  const num = 100 + Math.floor(Math.random() * 9900)
  const type = TYPES[i % 4]
  const constellation = CONSTELLATIONS[i % CONSTELLATIONS.length]
  const dist = 5 + Math.floor(Math.random() * 500)
  GALAXIES.push({
    id: `g${String(i).padStart(3, '0')}`,
    name: `NGC ${num}`,
    commonName: null,
    type,
    distanceMly: dist,
    constellation,
    description: `${type === 'spiral' ? 'Spirale' : type === 'elliptical' ? 'Elliptique' : type === 'lenticular' ? 'Lenticulaire' : 'Irrégulière'} située à ${dist} millions d'années-lumière dans ${constellation}.`,
    isRare: false,
    rareLabel: null,
  })
}
