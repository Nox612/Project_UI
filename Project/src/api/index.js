const OMDB_KEY = import.meta.env.VITE_OMDB_KEY

const parseYear = (v) => {
  const m = String(v ?? '').match(/\d{4}/)
  return m ? Number(m[0]) : null
}
const na = (v) => (v && v !== 'N/A' ? v : null)

