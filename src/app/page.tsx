import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Container from '@mui/material/Container'
import JobAccordion from './components/JobAccordion'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { AWAITING_MATERIALS, COMPLETE, SCHEDULED } from '../../constants'
import { fetchJobs } from '@/services/jobs'
import { Job } from '@/types'

interface JobListProps {
  defaultExpanded?: boolean
  header: string
  jobs: Job[]
}
const JobList = ({ defaultExpanded = false, header, jobs }: JobListProps) => (
  <Accordion defaultExpanded={defaultExpanded}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant='h6'>{header}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      {jobs.map(job => (
        <JobAccordion key={job.id} job={job} />
      ))}
    </AccordionDetails>
  </Accordion>
)

export default async function Home() {
  const jobs = await fetchJobs()
  const complete = jobs.filter(({ status }) => status === COMPLETE)
  const awaitingMaterials = jobs.filter(({ status }) => status === AWAITING_MATERIALS)
  const scheduled = jobs.filter(({ status }) => status === SCHEDULED)

  return (
    <Container maxWidth='lg' sx={{ p: 2 }}>
      <JobList header='Scheduled Jobs' jobs={scheduled} defaultExpanded />
      <JobList header='Jobs Awaiting Materials' jobs={awaitingMaterials} />
      <JobList header='Completed Jobs' jobs={complete} />
    </Container>
  )
}
