import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const treePlantingSites = [
  {
    name: 'Lake District Ancient Woodland',
    region: 'Cumbria',
    latitude: 54.4609,
    longitude: -3.0886,
    treesPlanted: 10247,
    species: ['Oak', 'Birch', 'Rowan', 'Scots Pine'],
    dateStarted: '2023-03-15',
    status: 'active',
    description: 'Our flagship planting site in the Lake District National Park, restoring native woodland and creating vital wildlife corridors.',
    area: '45 hectares',
  },
  {
    name: 'New Forest Community Grove',
    region: 'Hampshire',
    latitude: 50.8748,
    longitude: -1.5783,
    treesPlanted: 5320,
    species: ['Beech', 'Holly', 'Hawthorn', 'Yew'],
    dateStarted: '2023-06-01',
    status: 'active',
    description: 'A community-driven initiative to expand the ancient New Forest with native broadleaf species, engaging local schools and volunteers.',
    area: '22 hectares',
  },
  {
    name: 'Scottish Highlands Rewilding',
    region: 'Highlands',
    latitude: 57.3269,
    longitude: -5.0011,
    treesPlanted: 15800,
    species: ['Scots Pine', 'Caledonian Pine', 'Juniper', 'Silver Birch'],
    dateStarted: '2022-11-01',
    status: 'active',
    description: 'A large-scale rewilding project working alongside the National Trust for Scotland to restore Caledonian pine forest.',
    area: '80 hectares',
  },
  {
    name: 'Cotswolds Hedgerow Revival',
    region: 'Gloucestershire',
    latitude: 51.9285,
    longitude: -1.7247,
    treesPlanted: 3750,
    species: ['Hawthorn', 'Blackthorn', 'Field Maple', 'Hazel'],
    dateStarted: '2024-01-20',
    status: 'active',
    description: 'Restoring traditional hedgerows across Cotswold farmland, providing habitat corridors for wildlife and reducing soil erosion.',
    area: '18 hectares',
  },
  {
    name: 'Snowdonia Native Forest',
    region: 'Gwynedd',
    latitude: 52.9577,
    longitude: -3.9100,
    treesPlanted: 7200,
    species: ['Sessile Oak', 'Ash', 'Rowan', 'Wild Cherry'],
    dateStarted: '2023-09-10',
    status: 'active',
    description: 'Planting native Welsh broadleaf trees on former grazing land within Eryri (Snowdonia) National Park.',
    area: '35 hectares',
  },
  {
    name: 'Peak District Moors Restoration',
    region: 'Derbyshire',
    latitude: 53.3357,
    longitude: -1.7497,
    treesPlanted: 4100,
    species: ['Rowan', 'Silver Birch', 'Sessile Oak', 'Willow'],
    dateStarted: '2024-02-14',
    status: 'active',
    description: 'Restoring tree cover to the Dark Peak moorlands, stabilizing peat soils and creating new habitats for red grouse and mountain hares.',
    area: '20 hectares',
  },
  {
    name: 'Cornish Coastal Woodland',
    region: 'Cornwall',
    latitude: 50.4173,
    longitude: -5.0153,
    treesPlanted: 2850,
    species: ['Sessile Oak', 'Hazel', 'Holly', 'Wild Service Tree'],
    dateStarted: '2024-04-22',
    status: 'planned',
    description: 'A new planting project along the Cornish coast, creating a buffer zone between farmland and protected coastal habitats.',
    area: '14 hectares',
  },
  {
    name: 'Yorkshire Dales Riparian Planting',
    region: 'North Yorkshire',
    latitude: 54.3141,
    longitude: -2.2024,
    treesPlanted: 6100,
    species: ['Willow', 'Alder', 'Oak', 'Hawthorn'],
    dateStarted: '2023-07-08',
    status: 'completed',
    description: 'Tree planting along riverbanks in the Yorkshire Dales to reduce flooding, improve water quality, and enhance riparian habitats.',
    area: '28 hectares',
  },
  {
    name: 'Norfolk Broads Wetland Trees',
    region: 'Norfolk',
    latitude: 52.6200,
    longitude: 1.3800,
    treesPlanted: 4500,
    species: ['Alder', 'Willow', 'Oak', 'Aspen'],
    dateStarted: '2023-11-05',
    status: 'completed',
    description: 'Establishing native tree species around the Norfolk Broads to support wetland ecosystems and provide nesting sites for rare birds.',
    area: '25 hectares',
  },
  {
    name: 'Brecon Beacons Valley Oaks',
    region: 'Powys',
    latitude: 51.8800,
    longitude: -3.4300,
    treesPlanted: 3300,
    species: ['Pedunculate Oak', 'Ash', 'Small-leaved Lime', 'Wild Cherry'],
    dateStarted: '2024-03-01',
    status: 'active',
    description: 'Planting valley oak woodlands in the Brecon Beacons National Park, connecting fragmented habitats and supporting red kite populations.',
    area: '16 hectares',
  },
  {
    name: 'Northumberland Coast Guard',
    region: 'Northumberland',
    latitude: 55.4200,
    longitude: -1.5600,
    treesPlanted: 1950,
    species: ['Scots Pine', 'Hawthorn', 'Sea Buckthorn', 'Elder'],
    dateStarted: '2024-05-15',
    status: 'planned',
    description: 'Coastal tree planting to stabilise sand dunes and create windbreaks along the Northumberland Heritage Coast.',
    area: '10 hectares',
  },
  {
    name: 'Dorset AONB Community Forest',
    region: 'Dorset',
    latitude: 50.7400,
    longitude: -2.2600,
    treesPlanted: 5680,
    species: ['Oak', 'Ash', 'Field Maple', 'Wayfaring Tree'],
    dateStarted: '2023-08-20',
    status: 'active',
    description: 'Community-led planting within the Dorset Area of Outstanding Natural Beauty, creating new woodland for public enjoyment and wildlife.',
    area: '30 hectares',
  },
]

async function main() {
  console.log('🌱 Migrating planting sites...')
  for (const site of treePlantingSites) {
    await prisma.plantingSite.create({
      data: {
        ...site,
        species: JSON.stringify(site.species),
      },
    })
  }
  console.log('✅ Migration complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
