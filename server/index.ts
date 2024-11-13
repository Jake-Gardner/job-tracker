import express from 'express'
import jobsRouter from './routes/jobs'

const app = express()
const port = process.env.PORT || 3001

app.use(jobsRouter)

app.listen(port, () => {
  console.log('Server is listening at port '+ port)
})
