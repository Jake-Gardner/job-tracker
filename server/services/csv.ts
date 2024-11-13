import fs from 'node:fs'
import { parse } from 'csv-parse'

const loadCSV = async (path: fs.PathLike) => {
  const records = []
  const parser = fs
    .createReadStream(path)
    .pipe(parse())

  for await (const record of parser) {
    records.push(record)
  }

  const [headings, ...rows] = records

  return rows.map(row => {
    return row.reduce((acc: Record<string, string>, curr: string, i: number) => ({
     ...acc,
     [headings[i]]: curr
    }), {})
  })
}

const loadJobs = async () => {
  return (await loadCSV(`${__dirname}/../../jobs.csv`)).map(job => ({
    ...job,
    datetime: job.datetime ? new Date(job.datetime) : null,
    avg_cost_per_page: job.avg_cost_per_page ? parseInt(job.avg_cost_per_page) : null,
    materials_turned_in_at: job.materials_turned_in_at ? new Date(job.materials_turned_in_at) : null,
    provider_rating: job.provider_rating ? parseInt(job.provider_rating) : null,
    latitude: job.latitude ? parseFloat(job.latitude) : null,
    longitude: job.longitude ? parseFloat(job.longitude) : null,
  }))
}

const loadProviders = async () => {
  return (await loadCSV(`${__dirname}/../../providers.csv`)).map(provider => ({
    ...provider,
    latitude: provider.latitude ? parseFloat(provider.latitude) : null,
    longitude: provider.longitude ? parseFloat(provider.longitude) : null,
  }))
}

export const jobsPromise = loadJobs()
export const providersPromise = loadProviders()