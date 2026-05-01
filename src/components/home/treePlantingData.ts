import { TreePlantingSite } from './TreePlantingMap'

// This will now be populated from the database
let cachedSites: TreePlantingSite[] = []

export async function fetchPlantingSites(): Promise<TreePlantingSite[]> {
  try {
    const res = await fetch('/api/planting-sites')
    const data = await res.json()
    if (data.sites) {
      cachedSites = data.sites.map((s: any) => ({
        ...s,
        species: typeof s.species === 'string' ? JSON.parse(s.species) : s.species
      }))
      return cachedSites
    }
    return []
  } catch (error) {
    console.error('Failed to fetch planting sites:', error)
    return []
  }
}

export function getTotalTrees(sites: TreePlantingSite[] = cachedSites) {
  return sites.reduce((sum, site) => sum + site.treesPlanted, 0)
}

export function getTotalArea(sites: TreePlantingSite[] = cachedSites) {
  return sites.reduce((sum, site) => sum + parseInt(site.area || '0'), 0)
}

export function getActiveSites(sites: TreePlantingSite[] = cachedSites) {
  return sites.filter(s => s.status === 'active').length
}

