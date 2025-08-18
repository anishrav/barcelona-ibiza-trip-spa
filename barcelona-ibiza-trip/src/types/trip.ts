export type Lodging = { 
  link: string; 
  address: string; 
};

export type ScheduleItem = {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (24h)
  title: string;
  area: "Barcelona" | "Ibiza";
  location?: string;
  address?: string; // if present we render a Google Maps link
  url?: string; // optional external link (e.g., Airbnb listing)
  notes?: string;
};

export type Flight = {
  id: string;
  traveler: string; // e.g., "Anish + Sinha"
  from: string;
  to: string;
  flight: string; // e.g., "DL 128"
  date: string; // YYYY-MM-DD
  departtime?: string; // HH:mm
  arrivetime?: string; // HH:mm
  notes?: string;
};

export type TripData = {
  lodging: { barcelona: Lodging; ibiza: Lodging };
  schedule: ScheduleItem[];
  flights: Flight[];
  photos: string[];
};
