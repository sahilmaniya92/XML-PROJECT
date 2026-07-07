/** Your semester courses — used in notes, assignments, flashcards */
export const COURSES = [
  'xml/Js',
  'sqlServer',
  'OracleServer',
  'pl/sql',
  'DSA',
  'data analitics',
]

export function formatCourseLabel(course) {
  return course || COURSES[0]
}
