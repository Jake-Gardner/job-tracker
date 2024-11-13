export interface Provider {
  id: string
  full_name: string
  latitude?: number
  longitude?: number
}

export interface Job {
  id: string
  datetime: Date
  status: 'COMPLETE' | 'AWAITING MATERIALS' | 'SCHEDULED'
  provider_id: string
  avg_cost_per_page?: number
  materials_turned_in_at?: Date
  provider_rating?: number
  location_type: 'REMOTE' | 'LOCATION_BASED'
  latitude?: number
  longitude?: number
  provider?: Provider
  recommendedProviders?: Provider[]
}
