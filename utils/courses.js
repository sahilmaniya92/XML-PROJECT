// Parth — list of our semester courses (used in editor dropdown + assignments)
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
