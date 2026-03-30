import type { Badge } from '../types';

export const badgeDefinitions: Badge[] = [
  // ── Quantitative ──────────────────────────────────────────────────────────
  {
    id: 'visits-10',
    name: 'Groundhopper I',
    description: 'Visit 10 different grounds',
    icon: '🏟️',
    category: 'quantitative',
    requirement: { type: 'visits_count', threshold: 10 },
  },
  {
    id: 'visits-50',
    name: 'Groundhopper II',
    description: 'Visit 50 different grounds',
    icon: '🎫',
    category: 'quantitative',
    requirement: { type: 'visits_count', threshold: 50 },
  },
  {
    id: 'visits-100',
    name: 'Groundhopper III',
    description: 'Visit 100 different grounds',
    icon: '🏆',
    category: 'quantitative',
    requirement: { type: 'visits_count', threshold: 100 },
  },
  {
    id: 'bundeslaender-10',
    name: 'Deutschlandreise',
    description: 'Visit grounds in 10 different Bundesländer',
    icon: '🗺️',
    category: 'quantitative',
    requirement: { type: 'bundesland_count', threshold: 10 },
  },
  // ── Rail ──────────────────────────────────────────────────────────────────
  {
    id: 'rail-grounds-5',
    name: 'Gleishopper',
    description: 'Visit 5 rail-reachable grounds',
    icon: '🚆',
    category: 'rail',
    requirement: { type: 'rail_grounds', threshold: 5 },
  },
  {
    id: 'rail-grounds-20',
    name: 'Bahnsteiger',
    description: 'Visit 20 rail-reachable grounds',
    icon: '🛤️',
    category: 'rail',
    requirement: { type: 'rail_grounds', threshold: 20 },
  },
  // ── Variety ───────────────────────────────────────────────────────────────
  {
    id: 'floodlights-10',
    name: 'Nachtspiel',
    description: 'Visit 10 grounds with floodlights',
    icon: '💡',
    category: 'variety',
    requirement: { type: 'floodlight_grounds', threshold: 10 },
  },
  {
    id: 'stadiums-10k',
    name: 'Großstadion',
    description: 'Visit 10 stadiums with capacity over 10 000',
    icon: '🌟',
    category: 'variety',
    requirement: { type: 'large_stadium_grounds', threshold: 10 },
  },
  // ── Group ─────────────────────────────────────────────────────────────────
  {
    id: 'group-events-10',
    name: 'Gruppenplaner',
    description: 'Create 10 group events',
    icon: '📅',
    category: 'group',
    requirement: { type: 'group_events', threshold: 10 },
  },
  {
    id: 'group-visits-20',
    name: 'Teamplayer',
    description: 'Log 20 visits linked to a group',
    icon: '👥',
    category: 'group',
    requirement: { type: 'group_visits', threshold: 20 },
  },
  // ── Documentation ─────────────────────────────────────────────────────────
  {
    id: 'photos-50',
    name: 'Fotograf',
    description: 'Upload 50 ground photos',
    icon: '📷',
    category: 'documentation',
    requirement: { type: 'photos_count', threshold: 50 },
  },
];
