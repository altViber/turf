import type { PlaceSearchResult } from '../types';

// Mocked OSM-style place search results for meeting points
export const mockPlaceSearchResults: PlaceSearchResult[] = [
  // Stations
  { id: 'pl-1', label: 'München Hbf', type: 'station', address: 'Bahnhofplatz 2, 80335 München', coordinates: { lat: 48.1402, lng: 11.558 } },
  { id: 'pl-2', label: 'Dortmund Hbf', type: 'station', address: 'Königswall 15, 44137 Dortmund', coordinates: { lat: 51.5187, lng: 7.4591 } },
  { id: 'pl-3', label: 'Köln Hbf', type: 'station', address: 'Bahnhofsvorplatz 1, 50667 Köln', coordinates: { lat: 50.9426, lng: 6.9584 } },
  { id: 'pl-4', label: 'Berlin Hbf', type: 'station', address: 'Invalidenstraße 1, 10557 Berlin', coordinates: { lat: 52.5251, lng: 13.3694 } },
  { id: 'pl-5', label: 'Hamburg Hbf', type: 'station', address: 'Hachmannplatz 16, 20099 Hamburg', coordinates: { lat: 53.553, lng: 10.0062 } },
  { id: 'pl-6', label: 'Frankfurt (Main) Hbf', type: 'station', address: 'Am Hauptbahnhof 1, 60329 Frankfurt', coordinates: { lat: 50.1072, lng: 8.6631 } },
  { id: 'pl-7', label: 'Düsseldorf Hbf', type: 'station', address: 'Konrad-Adenauer-Platz 14, 40210 Düsseldorf', coordinates: { lat: 51.2195, lng: 6.7935 } },
  { id: 'pl-8', label: 'Bochum Hbf', type: 'station', address: 'Willy-Brandt-Platz 1, 44787 Bochum', coordinates: { lat: 51.4782, lng: 7.2253 } },
  { id: 'pl-9', label: 'Augsburg Hbf', type: 'station', address: 'Viktoriastraße 1, 86150 Augsburg', coordinates: { lat: 48.3645, lng: 10.8851 } },
  { id: 'pl-10', label: 'Leipzig Hbf', type: 'station', address: 'Willy-Brandt-Platz 1, 04105 Leipzig', coordinates: { lat: 51.3452, lng: 12.3821 } },
  // Pubs
  { id: 'pl-11', label: 'Augustiner Bräustuben', type: 'pub', address: 'Landsberger Str. 19, 80339 München', coordinates: { lat: 48.1376, lng: 11.5422 } },
  { id: 'pl-12', label: 'Brauerei Zum Wohl', type: 'pub', address: 'Bahnhofstraße 5, 44137 Dortmund', coordinates: { lat: 51.5185, lng: 7.4582 } },
  { id: 'pl-13', label: 'Kölner Hofbräu P. Josef', type: 'pub', address: 'Heumarkt 8, 50667 Köln', coordinates: { lat: 50.9358, lng: 6.9645 } },
  { id: 'pl-14', label: 'Berliner Kindl Schultheiss', type: 'pub', address: 'Invalidenstraße 6, 10115 Berlin', coordinates: { lat: 52.5244, lng: 13.3713 } },
  { id: 'pl-15', label: 'Gasthaus zum Löwen', type: 'pub', address: 'Hauptstraße 10, 80333 München', coordinates: { lat: 48.1382, lng: 11.5698 } },
  // Kiosks / Cafés
  { id: 'pl-16', label: 'Nordsee Hauptbahnhof München', type: 'kiosk', address: 'Bahnhofplatz 2, 80335 München', coordinates: { lat: 48.1401, lng: 11.5581 } },
  { id: 'pl-17', label: 'Brezel-Michi am Dom', type: 'kiosk', address: 'Domplatz 1, 50667 Köln', coordinates: { lat: 50.9413, lng: 6.9583 } },
  { id: 'pl-18', label: 'Currywurst Kiosk Dortmund', type: 'kiosk', address: 'Ostwall 25, 44135 Dortmund', coordinates: { lat: 51.5133, lng: 7.4657 } },
  { id: 'pl-19', label: 'Bäckerei Müller Hamburg', type: 'kiosk', address: 'Spitalerstraße 10, 20095 Hamburg', coordinates: { lat: 53.5509, lng: 10.0029 } },
  { id: 'pl-20', label: 'Café Ritter Berlin', type: 'kiosk', address: 'Schönhauser Allee 26, 10435 Berlin', coordinates: { lat: 52.5374, lng: 13.4116 } },
  // Addresses
  { id: 'pl-21', label: 'Marienplatz 1, München', type: 'address', address: 'Marienplatz 1, 80331 München', coordinates: { lat: 48.1374, lng: 11.5755 } },
  { id: 'pl-22', label: 'Alter Markt, Köln', type: 'address', address: 'Alter Markt 23, 50667 Köln', coordinates: { lat: 50.9366, lng: 6.9596 } },
  { id: 'pl-23', label: 'Brandenburger Tor, Berlin', type: 'address', address: 'Pariser Platz, 10117 Berlin', coordinates: { lat: 52.5163, lng: 13.3777 } },
  { id: 'pl-24', label: 'Freiheit 15, Hamburg', type: 'address', address: 'Freiheit 15, 22765 Hamburg', coordinates: { lat: 53.5504, lng: 9.9335 } },
  { id: 'pl-25', label: 'Am Wall 5, Bremen', type: 'address', address: 'Am Wall 5, 28195 Bremen', coordinates: { lat: 53.0769, lng: 8.8023 } },
];
