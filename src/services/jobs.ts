import { Job } from '@/types'

export const fetchJobs = async (): Promise<Job[]> => {
  const res = await fetch((process.env.API_HOST || 'http://localhost:3001') + '/jobs')

  const { jobs } = await res.json()

  return jobs
}
