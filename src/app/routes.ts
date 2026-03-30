import { createBrowserRouter, redirect } from 'react-router';
import { RootLayout } from './components/layout/RootLayout';
import { MapScreen } from './screens/MapScreen';
import { PlannerScreen } from './screens/PlannerScreen';
import { GroupDetailScreen } from './screens/GroupDetailScreen';
import { CreateEventScreen } from './screens/CreateEventScreen';
import { BadgesScreen } from './screens/BadgesScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { BookmarksScreen } from './screens/BookmarksScreen';

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      { index: true, loader: () => redirect('/map') },
      { path: 'map', Component: MapScreen },
      { path: 'planner', Component: PlannerScreen },
      { path: 'planner/groups/:groupId', Component: GroupDetailScreen },
      { path: 'planner/groups/:groupId/new-event', Component: CreateEventScreen },
      { path: 'badges', Component: BadgesScreen },
      { path: 'profile', Component: ProfileScreen },
      { path: 'profile/bookmarks', Component: BookmarksScreen },
    ],
  },
]);
