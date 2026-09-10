const Course = require('../models/Course');
const Podcast = require('../models/Podcast');
const ContentWatch = require('../models/ContentWatch');
const User = require('../models/User');
const { sendPushToUser } = require('./pushNotifications');
const {
  collectCourseLessons,
  collectPodcastEpisodes,
  applyDueCourseReleases,
  applyDuePodcastReleases,
} = require('../utils/episodeRelease');

async function notifyWatchers({ kind, parentId, itemKey, title, parentTitle }) {
  const watches = await ContentWatch.find({
    kind,
    parentId,
    itemKey: String(itemKey),
    notified: { $ne: true },
  });
  if (!watches.length) {
    return { notified: 0, watchers: 0 };
  }

  const users = await User.find({
    _id: { $in: watches.map((watch) => watch.user) },
    isActive: { $ne: false },
  }).select('pushToken name');

  const byId = new Map(users.map((user) => [String(user._id), user]));
  const label = title || 'The episode';
  const parent = parentTitle ? ` in ${parentTitle}` : '';
  let notified = 0;

  for (const watch of watches) {
    const user = byId.get(String(watch.user));
    if (user?.pushToken) {
      await sendPushToUser(user, {
        title: 'Your reminder is ready',
        body: `${label}${parent} is out now — tap to watch.`,
        data: {
          type: 'episode_released',
          kind,
          parentId: String(parentId),
          itemKey: String(itemKey),
        },
      });
      notified += 1;
    }
    watch.notified = true;
    watch.notifiedAt = new Date();
    await watch.save();
  }

  return { notified, watchers: watches.length };
}

async function notifyNewlyReleased(kind, previousDoc, nextDoc) {
  const previousItems = kind === 'course'
    ? collectCourseLessons(previousDoc)
    : collectPodcastEpisodes(previousDoc);
  const nextItems = kind === 'course'
    ? collectCourseLessons(nextDoc)
    : collectPodcastEpisodes(nextDoc);
  const stillLocked = new Set(
    nextItems.filter((item) => item.unreleased).map((item) => item.itemKey)
  );
  const parentTitle = nextDoc?.title || previousDoc?.title || '';
  const parentId = nextDoc?._id || previousDoc?._id;
  const released = previousItems.filter(
    (item) => item.unreleased && !stillLocked.has(item.itemKey)
  );

  let notified = 0;
  for (const item of released) {
    const result = await notifyWatchers({
      kind: item.kind,
      parentId,
      itemKey: item.itemKey,
      title: item.title,
      parentTitle,
    });
    notified += result.notified || 0;
  }
  return { released: released.length, notified };
}

async function runEpisodeReleaseJob(now = new Date()) {
  let coursesUpdated = 0;
  let podcastsUpdated = 0;
  let released = 0;
  let notified = 0;

  const courses = await Course.find({}).select('title sections');
  for (const course of courses) {
    const previous = course.toObject();
    const { changed } = applyDueCourseReleases(previous, now);
    if (!changed) continue;
    const { course: next } = applyDueCourseReleases(previous, now);
    const beforeLocked = collectCourseLessons(previous).filter((item) => item.unreleased);
    course.set('sections', next.sections);
    await course.save();
    coursesUpdated += 1;
    const afterLocked = new Set(
      collectCourseLessons(course).filter((item) => item.unreleased).map((item) => item.itemKey)
    );
    const justReleased = beforeLocked.filter((item) => !afterLocked.has(item.itemKey));
    released += justReleased.length;
    for (const item of justReleased) {
      const result = await notifyWatchers({
        kind: 'course_lesson',
        parentId: course._id,
        itemKey: item.itemKey,
        title: item.title,
        parentTitle: course.title,
      });
      notified += result.notified || 0;
    }
  }

  const podcasts = await Podcast.find({}).select('title episodes');
  for (const podcast of podcasts) {
    const previous = podcast.toObject();
    const { podcast: next, changed } = applyDuePodcastReleases(previous, now);
    if (!changed) continue;
    const beforeLocked = collectPodcastEpisodes(previous).filter((item) => item.unreleased);
    podcast.set('episodes', next.episodes);
    await podcast.save();
    podcastsUpdated += 1;
    const afterLocked = new Set(
      collectPodcastEpisodes(podcast).filter((item) => item.unreleased).map((item) => item.itemKey)
    );
    const justReleased = beforeLocked.filter((item) => !afterLocked.has(item.itemKey));
    released += justReleased.length;
    for (const item of justReleased) {
      const result = await notifyWatchers({
        kind: 'podcast_episode',
        parentId: podcast._id,
        itemKey: item.itemKey,
        title: item.title,
        parentTitle: podcast.title,
      });
      notified += result.notified || 0;
    }
  }

  return {
    at: now.toISOString(),
    coursesUpdated,
    podcastsUpdated,
    released,
    notified,
  };
}

module.exports = {
  notifyWatchers,
  notifyNewlyReleased,
  runEpisodeReleaseJob,
};
