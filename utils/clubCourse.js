export const CLUB_COURSE_TAG = 'elnady-club';
export const CLUB_COURSE_CATEGORY = 'Elnady Club';

export function isClubRecordedCourse(course) {
  if (!course) return false;
  if (course.isClub === true || course.raw?.isClub === true) return true;
  const category = String(course.category || course.raw?.category || '').trim();
  if (category === CLUB_COURSE_CATEGORY) return true;
  const tags = course.tags || course.raw?.tags || [];
  return Array.isArray(tags) && tags.includes(CLUB_COURSE_TAG);
}

export function withClubCourseTag(tags) {
  const list = (Array.isArray(tags) ? tags : []).map((t) => String(t || '').trim()).filter(Boolean);
  if (!list.includes(CLUB_COURSE_TAG)) list.push(CLUB_COURSE_TAG);
  return list;
}

export function mapCohortRecordedCourses(list) {
  if (!Array.isArray(list)) return [];
  return list.map((c, index) => ({
    _id: c._id || c.id || `club-course-${index}`,
    title: c.title || 'Untitled course',
    description: c.description || '',
    instructor: c.instructor || 'ELNADY',
    thumbnail: c.thumbnail || c.image || '',
    level: c.level || 'Beginner',
    duration: c.duration || '',
    category: CLUB_COURSE_CATEGORY,
    isClub: true,
    sections: c.sections || [
      {
        title: 'Intro',
        lessons: c.lessons || [],
      },
    ],
    lessons: c.lessons || [],
    raw: c,
  }));
}
