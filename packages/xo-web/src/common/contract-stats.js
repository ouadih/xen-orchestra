import { forOwn } from 'lodash'

const contractStats = (stats, nKeptItems) =>
  Array.isArray(stats)
    ? stats.splice(0, stats.length - nKeptItems)
    : forOwn(stats, metrics => contractStats(metrics, nKeptItems))

export { contractStats as default }
