'use client'

import { useState, ChangeEvent } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionActions from '@mui/material/AccordionActions'
import FormControl from '@mui/material/FormControl'
import FormLabel from '@mui/material/FormLabel'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import Divider from '@mui/material/Divider'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import { Job } from '@/types'
import { LOCATION_BASED, SCHEDULED } from '../../../constants'
import { formatDate } from '@/utils'

export default function JobAccordion({ job }: { job: Job }) {
  const [selectedProvider, setSelectedProvider] = useState('')
  const [tooltipOpen, setTooltipOpen] = useState(false)

  const onRadioChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedProvider(event.target.value)
  }

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div>
          <div><b>Id:</b> {job.id}</div>
          <div><b>Date:</b> {formatDate(job.datetime)}</div>
          <div><b>Type:</b> {job.location_type === LOCATION_BASED ? 'Location-based' : 'Remote'}</div>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <Divider sx={{ my: 2 }} />
        {job.status !== SCHEDULED && (
          <div>
            <div><b>Assigned provider:</b> {job.provider?.full_name}</div>
            {job.materials_turned_in_at && <div><b>Completed date:</b> {formatDate(job.materials_turned_in_at)}</div>}
          </div>
        )}
        {job.status === SCHEDULED && (
          <div>
            <FormControl>
              <FormLabel id="providers-radio-group-label">Recommended providers:</FormLabel>
              <RadioGroup
                aria-labelledby="providers-radio-group-label"
                name="providers-radio-group"
                value={selectedProvider}
                onChange={onRadioChange}
              >
                {job.recommendedProviders?.map(provider => (
                  <FormControlLabel
                    key={provider.id}
                    value={provider.full_name}
                    control={<Radio />}
                    label={provider.full_name}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </div>
        )}
      </AccordionDetails>
      {job.status === SCHEDULED && (
        <AccordionActions>
          <ClickAwayListener onClickAway={() => setTooltipOpen(false)}>
            <Tooltip
              title={<span style={{ fontSize: 18 }}>Feature not yet implemented!</span>}
              open={tooltipOpen}
              onClose={() => setTooltipOpen(false)}
              disableFocusListener
              disableHoverListener
              disableTouchListener
            >
              <Button disabled={!selectedProvider} onClick={() => setTooltipOpen(true)}>Select provider</Button>
            </Tooltip>
          </ClickAwayListener>
        </AccordionActions>
      )}
    </Accordion>
  )
}
