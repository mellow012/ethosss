import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding Ethoss database...");

  // Clear existing data to avoid unique constraint errors
  await db.comment.deleteMany();
  await db.postTag.deleteMany();
  await db.post.deleteMany();
  await db.event.deleteMany();
  await db.competitionEntry.deleteMany();
  await db.competition.deleteMany();
  await db.hotelReview.deleteMany();
  await db.hotel.deleteMany();
  await db.impactStat.deleteMany();
  // Categories and tags use upsert, so no need to delete

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await db.user.upsert({
    where: { email: "admin@ethoss.co.uk" },
    update: {},
    create: {
      email: "admin@ethoss.co.uk",
      name: "Ethoss Admin",
      password: hashedPassword,
      role: "admin",
      isVerified: true,
      bio: "Managing the Ethoss community and environmental mission.",
    },
  });

  // Create a regular user
  const userPassword = await bcrypt.hash("user123", 10);
  const user = await db.user.upsert({
    where: { email: "sarah@nature.co.uk" },
    update: {},
    create: {
      email: "sarah@nature.co.uk",
      name: "Sarah Green",
      password: userPassword,
      role: "user",
      isVerified: true,
      bio: "Nature enthusiast and tree planting volunteer.",
    },
  });

  // Create categories
  const categories = await Promise.all([
    db.category.upsert({
      where: { slug: "tree-planting" },
      update: {},
      create: { name: "Tree Planting", slug: "tree-planting", description: "Stories and updates about our tree planting initiatives across the UK." },
    }),
    db.category.upsert({
      where: { slug: "sustainability" },
      update: {},
      create: { name: "Sustainability", slug: "sustainability", description: "Tips, guides, and news about sustainable living practices." },
    }),
    db.category.upsert({
      where: { slug: "eco-tourism" },
      update: {},
      create: { name: "Eco-Tourism", slug: "eco-tourism", description: "Discover eco-friendly travel destinations and experiences." },
    }),
    db.category.upsert({
      where: { slug: "community" },
      update: {},
      create: { name: "Community", slug: "community", description: "Community events, meetups, and volunteer opportunities." },
    }),
    db.category.upsert({
      where: { slug: "wildlife" },
      update: {},
      create: { name: "Wildlife", slug: "wildlife", description: "UK wildlife conservation efforts and nature photography." },
    }),
  ]);

  // Create tags
  const tags = await Promise.all([
    db.tag.upsert({ where: { slug: "nature" }, update: {}, create: { name: "Nature", slug: "nature" } }),
    db.tag.upsert({ where: { slug: "conservation" }, update: {}, create: { name: "Conservation", slug: "conservation" } }),
    db.tag.upsert({ where: { slug: "volunteering" }, update: {}, create: { name: "Volunteering", slug: "volunteering" } }),
    db.tag.upsert({ where: { slug: "uk" }, update: {}, create: { name: "UK", slug: "uk" } }),
    db.tag.upsert({ where: { slug: "green-energy" }, update: {}, create: { name: "Green Energy", slug: "green-energy" } }),
    db.tag.upsert({ where: { slug: "biodiversity" }, update: {}, create: { name: "Biodiversity", slug: "biodiversity" } }),
    db.tag.upsert({ where: { slug: "eco-friendly" }, update: {}, create: { name: "Eco-Friendly", slug: "eco-friendly" } }),
    db.tag.upsert({ where: { slug: "carbon-offset" }, update: {}, create: { name: "Carbon Offset", slug: "carbon-offset" } }),
  ]);

  // Create blog posts
  const posts = await Promise.all([
    db.post.create({
      data: {
        title: "10,000 Trees Planted in the Lake District",
        slug: "10000-trees-planted-lake-district",
        content: `# A Milestone in Conservation\n\nWe are thrilled to announce that our collaborative tree-planting initiative in the Lake District has reached a remarkable milestone — 10,000 native trees have been successfully planted across the region.\n\n## The Impact\n\nThese trees, comprising oak, birch, rowan, and Scots pine species, will create vital wildlife corridors, improve air quality, and help restore the natural landscape that makes the Lake District so special.\n\n## Community Involvement\n\nOver 500 volunteers from across the UK joined us for this project, dedicating their weekends to making a tangible difference. Local schools participated in educational workshops, teaching children about the importance of woodland ecosystems.\n\n## What's Next\n\nOur next target is 25,000 trees by the end of 2026. We are partnering with the National Trust and local farmers to identify new planting sites that will maximize ecological benefit.\n\n*Join us in making a difference — every tree counts.*`,
        excerpt: "Our collaborative tree-planting initiative reaches a remarkable milestone with 10,000 native trees planted across the Lake District.",
        coverImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=600&fit=crop",
        published: true,
        featured: true,
        authorId: admin.id,
        categoryId: categories[0].id,
      },
    }),
    db.post.create({
      data: {
        title: "Your Guide to Sustainable Travel in the UK",
        slug: "guide-sustainable-travel-uk",
        content: `# Sustainable Travel: A Complete Guide\n\nTravelling sustainably in the UK is easier than ever. From eco-friendly hotels to low-carbon transport options, here's everything you need to know to minimise your environmental impact while exploring this beautiful country.\n\n## Getting Around Sustainably\n\n### Train Travel\n\nThe UK's rail network connects most major cities and many rural destinations. Consider purchasing a railcard for significant discounts. Sleeper services to Scotland are a fantastic way to reduce your carbon footprint.\n\n### Electric Vehicle Hire\n\nEV hire is now available in most cities. Companies like Zipcar and Enterprise offer electric vehicles, making it convenient to explore rural areas without emissions.\n\n## Eco-Friendly Accommodation\n\nLook for hotels with recognised eco-certifications. Our hotel directory features only verified eco-friendly establishments that meet strict sustainability criteria.\n\n## Leave No Trace\n\nWherever you go, follow the Leave No Trace principles. Take your rubbish with you, stay on marked paths, and respect local wildlife.`,
        excerpt: "Everything you need to know about minimising your environmental impact while exploring the United Kingdom.",
        coverImage: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=600&fit=crop",
        published: true,
        featured: true,
        authorId: admin.id,
        categoryId: categories[1].id,
      },
    }),
    db.post.create({
      data: {
        title: "Spring Wildlife Watch: What to Spot This Season",
        slug: "spring-wildlife-watch",
        content: `# Spring Wildlife Guide\n\nSpring is one of the most exciting times for wildlife watching in the UK. As nature awakens, there's an incredible array of species to discover.\n\n## Birds to Watch For\n\n### Migratory Arrivals\n\n- **Swallows and House Martins**: Usually arrive in April from Africa\n- **Cuckoos**: Listen for their distinctive call in woodland areas\n- **Willow Warblers**: Small, energetic birds found in hedgerows\n\n### Resident Species\n\n- **Blue Tits and Great Tits**: Active at bird feeders\n- **Robins**: Singing to establish territories\n- **Kingfishers**: Along rivers and streams\n\n## Mammals Emerging\n\n- **Hedgehogs**: Coming out of hibernation\n- **Badgers**: Cubs start exploring\n- **Otters**: More visible along waterways\n\n## Wildflowers\n\nBluebells, primroses, and wild garlic transform woodlands into carpets of colour. Visit ancient woodlands for the most spectacular displays.`,
        excerpt: "Discover the incredible wildlife emerging across the UK this spring, from migratory birds to woodland wildflowers.",
        coverImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=600&fit=crop",
        published: true,
        featured: false,
        authorId: admin.id,
        categoryId: categories[4].id,
      },
    }),
    db.post.create({
      data: {
        title: "How to Start Your Own Community Garden",
        slug: "start-community-garden",
        content: `# Starting a Community Garden\n\nCommunity gardens are transformative spaces that bring people together, grow fresh food, and create havens for wildlife in urban areas. Here's your step-by-step guide to getting started.\n\n## Finding a Site\n\nLook for vacant lots, unused council land, or spaces within existing parks. Contact your local council about potential sites and permissions.\n\n## Building Your Team\n\nGather a core group of committed volunteers. Reach out through social media, community centres, and local notice boards. Diversity in skills and backgrounds strengthens the project.\n\n## Planning the Garden\n\n### Design Considerations\n- Raised beds for accessibility\n- Composting area\n- Rainwater harvesting\n- Wildlife-friendly features (bug hotels, bird boxes)\n- Seating and social spaces\n\n## Getting Funding\n\nNumerous grants are available for community projects. Check with the National Lottery Community Fund, local councils, and environmental charities.`,
        excerpt: "A practical guide to creating a thriving community garden in your neighbourhood, from finding land to growing your first crops.",
        coverImage: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&h=600&fit=crop",
        published: true,
        featured: false,
        authorId: admin.id,
        categoryId: categories[3].id,
      },
    }),
  ]);

  // Link tags to posts
  await Promise.all([
    db.postTag.create({ data: { postId: posts[0].id, tagId: tags[0].id } }),
    db.postTag.create({ data: { postId: posts[0].id, tagId: tags[1].id } }),
    db.postTag.create({ data: { postId: posts[0].id, tagId: tags[2].id } }),
    db.postTag.create({ data: { postId: posts[0].id, tagId: tags[3].id } }),
    db.postTag.create({ data: { postId: posts[1].id, tagId: tags[4].id } }),
    db.postTag.create({ data: { postId: posts[1].id, tagId: tags[5].id } }),
    db.postTag.create({ data: { postId: posts[1].id, tagId: tags[6].id } }),
    db.postTag.create({ data: { postId: posts[2].id, tagId: tags[0].id } }),
    db.postTag.create({ data: { postId: posts[2].id, tagId: tags[3].id } }),
    db.postTag.create({ data: { postId: posts[3].id, tagId: tags[2].id } }),
    db.postTag.create({ data: { postId: posts[3].id, tagId: tags[6].id } }),
  ]);

  // Create approved comments
  await Promise.all([
    db.comment.create({
      data: {
        content: "This is incredible! I volunteered for the Lake District planting and it was such a rewarding experience. Can't wait for the next one!",
        authorId: user.id,
        postId: posts[0].id,
        approved: true,
      },
    }),
    db.comment.create({
      data: {
        content: "The rail tips are really useful. I've been trying to reduce my travel carbon footprint and this guide has given me some great ideas.",
        authorId: user.id,
        postId: posts[1].id,
        approved: true,
      },
    }),
  ]);

  // Create hotels
  const hotels = await Promise.all([
    db.hotel.create({
      data: {
        name: "The Green Man Inn",
        slug: "green-man-inn-cotswolds",
        description: `# A Hidden Gem in the Cotswolds\n\nNestled in the rolling hills of the Cotswolds, The Green Man Inn is a beautifully restored 17th-century coaching inn that combines historic charm with modern eco-friendly amenities.\n\n## Sustainability Features\n\n- Solar panels providing 80% of electricity needs\n- Rainwater harvesting system for garden irrigation\n- Locally sourced organic produce in the restaurant\n- Electric vehicle charging points\n- Zero single-use plastics policy\n\n## Accommodation\n\nTwelve individually designed bedrooms feature organic cotton bedding, natural paint finishes, and reclaimed wood furnishings. Each room offers views of the surrounding countryside.`,
        shortDesc: "A beautifully restored 17th-century coaching inn combining historic charm with modern eco-friendly amenities in the heart of the Cotswolds.",
        coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
        gallery: JSON.stringify([
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
        ]),
        address: "12 High Street",
        city: "Stow-on-the-Wold",
        region: "South West",
        postcode: "GL54 1AF",
        latitude: 51.9285,
        longitude: -1.7247,
        ecoRating: 5,
        priceRange: "£££",
        amenities: JSON.stringify(["Restaurant", "Bar", "Garden", "EV Charging", "Free WiFi", "Organic Breakfast", "Dog Friendly"]),
        website: "https://example.com/greenman",
        phone: "+44 1451 830000",
        email: "stay@greenman.co.uk",
        featured: true,
        verified: true,
      },
    }),
    db.hotel.create({
      data: {
        name: "EcoLodge Highlands",
        slug: "ecolodge-highlands",
        description: `# Sustainable Luxury in the Scottish Highlands\n\nEcoLodge Highlands offers an unforgettable retreat in one of Europe's last great wildernesses. Our off-grid lodges are designed to have minimal environmental impact while providing maximum comfort.\n\n## Sustainability Features\n\n- Fully off-grid with solar and wind power\n- Ground source heat pump for heating\n- Grey water recycling system\n- Moss-roof construction for natural insulation\n- Carbon-neutral operations since 2019\n\n## Activities\n\nGuided nature walks, wildlife photography workshops, stargazing evenings, and traditional Scottish cookery classes using foraged ingredients.`,
        shortDesc: "Off-grid luxury lodges in the Scottish Highlands offering an unforgettable sustainable retreat in pristine wilderness.",
        coverImage: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&h=600&fit=crop",
        gallery: JSON.stringify([
          "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&h=600&fit=crop",
        ]),
        address: "Glen Affric",
        city: "Inverness",
        region: "Scotland",
        postcode: "IV3 8NR",
        latitude: 57.3269,
        longitude: -5.0011,
        ecoRating: 5,
        priceRange: "££££",
        amenities: JSON.stringify(["Hot Tub", "Guided Walks", "WiFi", "Kitchen", "Fireplace", "Mountain Views", "Wildlife Tours"]),
        website: "https://example.com/ecolodge",
        phone: "+44 1463 710000",
        email: "stay@ecolodge.scot",
        featured: true,
        verified: true,
      },
    }),
    db.hotel.create({
      data: {
        name: "Willow Tree Cottage",
        slug: "willow-tree-cottage-yorkshire",
        description: `# A Cosy Eco-Retreat in Yorkshire\n\nWillow Tree Cottage is a charming stone-built holiday cottage set in two acres of wildflower meadow in the Yorkshire Dales. Perfect for a peaceful getaway surrounded by nature.\n\n## Sustainability Features\n\n- Wool insulation throughout\n- Wood-burning stove from sustainable sources\n- Organic kitchen garden\n- Composting toilet system\n- Wildlife-friendly landscaping`,
        shortDesc: "A cosy stone-built holiday cottage set in two acres of wildflower meadow in the Yorkshire Dales. Perfect for a peaceful getaway surrounded by nature.",
        coverImage: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&h=600&fit=crop",
        gallery: JSON.stringify([
          "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&h=600&fit=crop",
        ]),
        address: "Gayle Lane",
        city: "Hawes",
        region: "Yorkshire",
        postcode: "DL8 3NP",
        latitude: 54.3141,
        longitude: -2.2024,
        ecoRating: 4,
        priceRange: "££",
        amenities: JSON.stringify(["Garden", "Wood Burner", "Dog Friendly", "Free Parking", "Kitchen", "Washing Machine"]),
        website: "https://example.com/willowtree",
        phone: "+44 1969 660000",
        email: "stay@willowtree.co.uk",
        featured: false,
        verified: true,
      },
    }),
    db.hotel.create({
      data: {
        name: "The Solar Coast Hotel",
        slug: "solar-coast-hotel-cornwall",
        description: `# Ocean Views, Solar Power\n\nThe Solar Coast Hotel sits on the dramatic cliffs of Cornwall's north coast. Our beachfront location is powered entirely by renewable energy, making your seaside holiday as green as it is gorgeous.\n\n## Sustainability Features\n\n- 200+ solar panels on rooftop\n- Heat pump pool heating\n- Zero-waste restaurant\n- Beach clean-up programme\n- Local marine conservation partnerships`,
        shortDesc: "A beachfront hotel on Cornwall's dramatic north coast, powered entirely by renewable energy with stunning ocean views.",
        coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
        gallery: JSON.stringify([
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
        ]),
        address: "Trevose Head",
        city: "Padstow",
        region: "South West",
        postcode: "PL28 8NQ",
        latitude: 50.4173,
        longitude: -5.0153,
        ecoRating: 4,
        priceRange: "£££",
        amenities: JSON.stringify(["Pool", "Spa", "Restaurant", "Ocean Views", "EV Charging", "Free WiFi", "Surf School"]),
        website: "https://example.com/solarcoast",
        phone: "+44 1841 520000",
        email: "stay@solarcoast.co.uk",
        featured: true,
        verified: true,
      },
    }),
    db.hotel.create({
      data: {
        name: "Forest Barn Retreat",
        slug: "forest-barn-retreat-new-forest",
        description: `# Rustic Charm in the New Forest\n\nConverted from a historic barn, this retreat offers a unique blend of rustic character and modern comfort, surrounded by the ancient woodlands of the New Forest National Park.\n\n## Sustainability Features\n\n- Sheep's wool insulation\n- Rainwater collection\n- Locally sourced timber\n- Wildlife-friendly gardens\n- Cycling hire available`,
        shortDesc: "A converted historic barn surrounded by the ancient woodlands of the New Forest National Park, perfect for nature lovers.",
        coverImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
        gallery: JSON.stringify([
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop",
        ]),
        address: "Lyndhurst",
        city: "Lyndhurst",
        region: "South East",
        postcode: "SO43 7DE",
        latitude: 50.8748,
        longitude: -1.5783,
        ecoRating: 4,
        priceRange: "££",
        amenities: JSON.stringify(["Garden", "Free Parking", "Kitchen", "Cycling", "Hiking Trails", "Fire Pit", "Dog Friendly"]),
        website: "https://example.com/forestbarn",
        phone: "+44 2380 282000",
        email: "stay@forestbarn.co.uk",
        featured: false,
        verified: true,
      },
    }),
    db.hotel.create({
      data: {
        name: "Snowdonia Eco Pod",
        slug: "snowdonia-eco-pod",
        description: `# Glamping Under the Stars in Snowdonia\n\nExperience the beauty of Snowdonia National Park from our purpose-built eco pods. Each pod offers panoramic mountain views while maintaining a minimal environmental footprint.\n\n## Sustainability Features\n\n- Recycled shipping container construction\n- Solar power and battery storage\n- Rainwater collection and filtration\n- Composting facilities\n- Dark sky friendly lighting`,
        shortDesc: "Purpose-built eco pods in Snowdonia National Park offering panoramic mountain views with a minimal environmental footprint.",
        coverImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop",
        gallery: JSON.stringify([
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop",
        ]),
        address: "A470",
        city: "Betws-y-Coed",
        region: "Wales",
        postcode: "LL24 0AE",
        latitude: 53.1057,
        longitude: -3.8011,
        ecoRating: 5,
        priceRange: "£",
        amenities: JSON.stringify(["Mountain Views", "Hot Tub", "Kitchen", "Free Parking", "Hiking", "Dark Sky Views", "Fire Pit"]),
        website: "https://example.com/ecnopod",
        phone: "+44 1690 710000",
        email: "stay@ecnopod.wales",
        featured: true,
        verified: true,
      },
    }),
  ]);

  // Create hotel reviews
  await Promise.all([
    db.hotelReview.create({
      data: { rating: 5, content: "Absolutely magical stay. The commitment to sustainability is evident in every detail, and the food was outstanding.", authorName: "James W.", hotelId: hotels[0].id },
    }),
    db.hotelReview.create({
      data: { rating: 5, content: "The off-grid experience was incredible. We saw red deer, golden eagles, and the northern lights all from our lodge!", authorName: "Emma R.", hotelId: hotels[1].id },
    }),
    db.hotelReview.create({
      data: { rating: 4, content: "Perfect peaceful retreat. The wildflower meadow was beautiful and the cottage had everything we needed.", authorName: "Tom H.", hotelId: hotels[2].id },
    }),
    db.hotelReview.create({
      data: { rating: 5, content: "Waking up to ocean views powered by sunshine — what's not to love? The surf school was brilliant too.", authorName: "Lily K.", hotelId: hotels[3].id },
    }),
    db.hotelReview.create({
      data: { rating: 4, content: "The New Forest location is perfect. We saw wild ponies every morning! The barn conversion is beautifully done.", authorName: "David M.", hotelId: hotels[4].id },
    }),
    db.hotelReview.create({
      data: { rating: 5, content: "Stargazing from the eco pod was a highlight of our year. Minimal luxury with maximum views. Will definitely return.", authorName: "Sarah P.", hotelId: hotels[5].id },
    }),
  ]);

  // Create competitions
  const now = new Date();
  const competitions = await Promise.all([
    db.competition.create({
      data: {
        title: "Capture the Beauty of British Woodlands",
        slug: "capture-beauty-british-woodlands",
        description: `# Photography Competition\n\nWe're looking for the most stunning photographs of British woodlands. Whether it's the golden autumn leaves of the New Forest, the bluebell-carpeted floors of ancient oaks, or the misty mornings in the Scottish Highlands — we want to see your best shots.\n\n## Prizes\n\n- **1st Prize**: Weekend stay at EcoLodge Highlands (worth £500)\n- **2nd Prize**: £200 outdoor equipment voucher\n- **3rd Prize**: Ethoss membership + tree planted in your name\n\n## How to Enter\n\n1. Take a photo in any British woodland\n2. Upload your entry with a brief description (max 200 words)\n3. Share on social media with #EthossWoodlands`,
        rules: "- Photos must be taken in the UK\n- Maximum 3 entries per person\n- Photos must be your own original work\n- No heavy editing or AI-generated images\n- Competition runs until the end date listed",
        coverImage: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=600&fit=crop",
        prize: "Weekend stay at EcoLodge Highlands + £200 voucher",
        entryType: "photo",
        startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        maxEntries: 3,
      },
    }),
    db.competition.create({
      data: {
        title: "My Tree Planting Story",
        slug: "my-tree-planting-story",
        description: `# Share Your Story\n\nHave you participated in a tree-planting event? Or perhaps you've planted a tree in your own garden? We want to hear your story!\n\nTell us about your experience — what inspired you, how it felt to plant, and what it means to you to contribute to a greener future.\n\n## Prizes\n\n- **Winner**: Feature on our website + Ethoss goodie bag + tree planted in your honour\n- **Runner-up**: Ethoss goodie bag`,
        rules: "- Stories must be original and true\n- Maximum 500 words\n- One entry per person\n- By entering, you grant Ethoss permission to publish your story",
        coverImage: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
        prize: "Feature on website + Ethoss goodie bag + tree planted in your honour",
        entryType: "story",
        startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        isActive: true,
        maxEntries: 1,
      },
    }),
    db.competition.create({
      data: {
        title: "Eco-Quiz: How Green Are You?",
        slug: "eco-quiz-how-green-are-you",
        description: `# Test Your Green Knowledge\n\nThink you know everything about environmental sustainability? Take our eco-quiz and find out! Answer 20 questions about climate change, biodiversity, sustainable living, and UK conservation.\n\n## Prizes\n\n- **Perfect Score**: Ethoss premium membership (1 year)\n- **Top 10**: Ethoss tote bag + seed packet\n\nGood luck!`,
        rules: "- One attempt per person\n- No time limit\n- Answers are final once submitted",
        coverImage: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&h=600&fit=crop",
        prize: "Ethoss premium membership + goodie bags for top scorers",
        entryType: "quiz",
        startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        isActive: true,
        maxEntries: 1,
      },
    }),
  ]);

  // Create competition entries
  await Promise.all([
    db.competitionEntry.create({
      data: {
        competitionId: competitions[0].id,
        userId: user.id,
        content: "Captured this stunning shot of early morning mist rolling through ancient oaks in the New Forest. The way the light filters through the canopy creates an ethereal atmosphere that reminds us why protecting these spaces is so important.",
        imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop",
        status: "approved",
      },
    }),
    db.competitionEntry.create({
      data: {
        competitionId: competitions[1].id,
        userId: user.id,
        content: "Last spring, I joined a community tree-planting event in my local park. Armed with spades and saplings, our group of twenty planted over 200 native trees in a single morning. The children in our group named each tree — my favourite was 'Oakley' planted by a six-year-old girl who said she wanted Oakley to grow tall so birds could live in his branches. That moment crystallised everything about why I volunteer: it's not just about carbon capture or biodiversity targets — it's about creating a living legacy that the next generation will nurture and enjoy. Every time I walk past that park now, I see those saplings growing, and I feel a profound sense of hope for our planet's future.",
        status: "approved",
      },
    }),
  ]);

  // Create impact stats
  await Promise.all([
    db.impactStat.create({ data: { label: "Trees Planted", value: "25,000", icon: "TreePine", order: 0 } }),
    db.impactStat.create({ data: { label: "Active Members", value: "5,200", icon: "Users", order: 1 } }),
    db.impactStat.create({ data: { label: "Hotels Listed", value: "150+", icon: "Building2", order: 2 } }),
    db.impactStat.create({ data: { label: "Competitions Won", value: "340", icon: "Trophy", order: 3 } }),
    db.impactStat.create({ data: { label: "Volunteer Hours", value: "12,500", icon: "Clock", order: 4 } }),
    db.impactStat.create({ data: { label: "Carbon Offset (tonnes)", value: "850", icon: "Leaf", order: 5 } }),
  ]);

  // Create events
  await Promise.all([
    db.event.create({
      data: {
        title: "Community Tree Planting Day",
        description: "Join us for a hands-on tree planting session in the heart of the Peak District. No experience necessary!",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 2 weeks from now
        location: "Peak District National Park",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop",
      },
    }),
    db.event.create({
      data: {
        title: "Sustainability Workshop",
        description: "Learn practical tips for reducing your carbon footprint and living more sustainably in this interactive workshop.",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week from now
        location: "London Eco-Hub",
        image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop",
      },
    }),
    db.event.create({
      data: {
        title: "Beach Clean-up Initiative",
        description: "Help us protect marine life by clearing plastic waste from the beautiful Cornish coastline.",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21), // 3 weeks from now
        location: "Penzance, Cornwall",
        image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&h=600&fit=crop",
      },
    }),
  ]);

  // Create planting sites
  await Promise.all([
    db.plantingSite.create({
      data: {
        name: "Lake District Reforestation",
        region: "Cumbria",
        latitude: 54.4609,
        longitude: -3.0886,
        treesPlanted: 5200,
        species: JSON.stringify(["Oak", "Birch", "Hazel"]),
        dateStarted: "2023-04-15",
        status: "active",
        description: "Restoring native woodland cover to the northern fells.",
        area: "12 hectares",
      },
    }),
    db.plantingSite.create({
      data: {
        name: "Dartmoor Community Woods",
        region: "Devon",
        latitude: 50.5719,
        longitude: -3.9207,
        treesPlanted: 3100,
        species: JSON.stringify(["Rowan", "Willow", "Alder"]),
        dateStarted: "2023-11-20",
        status: "active",
        description: "Community-led planting initiative on the edge of the moor.",
        area: "8 hectares",
      },
    }),
    db.plantingSite.create({
      data: {
        name: "Peak District Green Belt",
        region: "Derbyshire",
        latitude: 53.35,
        longitude: -1.83,
        treesPlanted: 10000,
        species: JSON.stringify(["Pine", "Spruce", "Larch"]),
        dateStarted: "2022-03-10",
        status: "completed",
        description: "Major reforestation project to stabilize hillsides.",
        area: "25 hectares",
      },
    }),
  ]);

  console.log("✅ Seed data created successfully!");
  console.log("👤 Admin: admin@ethoss.co.uk / admin123");
  console.log("👤 User: sarah@nature.co.uk / user123");
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
