import moment from 'moment'

export const formatDate = (date: Date) => moment(date).format('MMM Do YYYY, h:mm:ss a')
