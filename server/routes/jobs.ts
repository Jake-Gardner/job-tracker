import { Router } from 'express'
import { getDistance } from 'geolib'
import { jobsPromise, providersPromise } from '../services/csv'
import { AWAITING_MATERIALS, COMPLETE, LOCATION_BASED } from '../../constants'

const router = Router()

router.get('/jobs', async (req, res) => {
  const [jobs, providers] = await Promise.all([jobsPromise, providersPromise])

  interface ProviderStats {
    avgResponseTime: number
    avgCost: number
    positiveRatings: number
  }

  // Calculate stats for each provider based on their previous jobs completed:
  // average time to complete, average cost charged per job, total positive ratings
  const providerStats: Record<string, ProviderStats> = providers.reduce((stats, provider) => {
    const providerJobs = jobs.filter(({ provider_id, status }) => provider_id === provider.id && status === COMPLETE)

    const avgResponseTime = providerJobs.map(({ datetime, materials_turned_in_at }) => materials_turned_in_at - datetime)
      .reduce((totalTime, responseTime) => totalTime + responseTime, 0) / providerJobs.length

    const avgCost = providerJobs.reduce((totalCost, job) => totalCost + job.avg_cost_per_page, 0) / providerJobs.length

    const positiveRatings = providerJobs.reduce((totalRating, job) => totalRating + job.provider_rating, 0)

    return {
      ...stats,
      [provider.id]: { avgResponseTime, avgCost, positiveRatings }
    }
  }, {})

  const getMinMax = (key: 'avgResponseTime' | 'avgCost' | 'positiveRatings') => {
    const values = Object.values(providerStats)
      .map(stat => stat[key])
      .filter(value => !isNaN(value))

    return [Math.min(...values), Math.max(...values)]
  }

  const [minRespTime, maxRespTime] = getMinMax('avgResponseTime')
  const [minAvgCost, maxAvgCost] = getMinMax('avgCost')
  const [minRating, maxRating] = getMinMax('positiveRatings')

  // Normalize the values previously calculated for each provider, i.e. convert them all to a value
  // between 0 and 1, 0 being the worst of the available values and 1 being the best
  const normalizedStats: Record<string, ProviderStats> = Object.entries(providerStats).reduce((normalizedStats, [providerId, stats]) => ({
    ...normalizedStats,
    [providerId]: {
      ...stats,
      avgResponseTime: isNaN(stats.avgResponseTime) ? 0 : Math.abs((stats.avgResponseTime - minRespTime) / (maxRespTime - minRespTime) - 1),
      avgCost: isNaN(stats.avgCost) ? 0 : Math.abs((stats.avgCost - minAvgCost) / (maxAvgCost - minAvgCost) - 1),
      positiveRatings: (stats.positiveRatings - minRating) / (maxRating - minRating)
    }
  }), {})

  const jobsResponse = jobs.map(job => {
    if (job.status === COMPLETE || job.status === AWAITING_MATERIALS) {
      // Include the assigned provider as part of the response
      return {
        ...job,
        provider: providers.find(({ id }) => id === job.provider_id)
      }
    } else {
      let distanceScores: Record<string, number>
      if (job.location_type === LOCATION_BASED) {
        // Calculate the distances of each provider from the job location, and normalize the
        // values, 1 being the closest, 0 being the farthest
        const distances: Record<string, number> = providers.reduce((distances, provider) => {
          const distance = provider.latitude ? getDistance(
            { latitude: provider.latitude, longitude: provider.longitude },
            { latitude: job.latitude, longitude: job.longitude }
          ) : -1
  
          return {
            ...distances,
            [provider.id]: distance
          }
        }, {})

        const distanceValues = Object.values(distances).filter((distance) => distance >= 0)
        const maxDistance = Math.max(...distanceValues)
        const minDistance = Math.min(...distanceValues)

        distanceScores = Object.entries(distances).reduce((scores, [providerId, distance]) => ({
          ...scores,
          [providerId]: distance < 0 ? 0 : Math.abs((distance - minDistance) / (maxDistance - minDistance) - 1)
        }), {})
      }

      // Add up all normalized values for each provider, resulting in a minimum score of 0 (worst choice)
      // and a maximum of 3 for remote jobs and 4 for location-based jobs (best choice)
      // In this implementation, all provider stats are given the same weight (0-1), but stats
      // could easily be weighted greater than others here by multiplying the normalized value
      const scores: Record<string, number> = Object.entries(normalizedStats).reduce((scores, [providerId, stats]) => {
        let total = Object.values(stats as ProviderStats).reduce((total, currStat) => total + currStat, 0)
        if (job.location_type === LOCATION_BASED) {
          total += distanceScores[providerId]
        }
        return {
          ...scores,
          [providerId]: total
        }
      }, {})

      return {
        ...job,
        recommendedProviders: providers.toSorted((a, b) => scores[b.id] - scores[a.id])
      }
    }
  })

  res.json({ jobs: jobsResponse })
})

export default router
