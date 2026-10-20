export const STATUSES = ['want', 'in-progress', 'done']

const LABELS = {
  movie: { want: 'Want to Watch', 'in-progress': 'Watching', done: 'Completed' },
  book: { want: 'Want to Read', 'in-progress': 'Reading', done: 'Completed' },
}

export const statusLabel = (type, status) => LABELS[type][status]