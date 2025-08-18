"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Calendar,
  Copy,
  ExternalLink,
  Home,
  MapPin,
  Plane,
  Plus,
  Image,
  Pencil,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ----------------------------
// Types
// ----------------------------

type Lodging = { link: string; address: string };

type ScheduleItem = {
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

type Flight = {
  id: string;
  traveler: string; // e.g., "Anish + Sinha"
  from: string;
  to: string;
  flight: string; // e.g., "DL 128"
  date: string; // YYYY-MM-DD
  departTime?: string; // HH:mm
  arriveTime?: string; // HH:mm
  notes?: string;
};

type TripData = {
  lodging: { barcelona: Lodging; ibiza: Lodging };
  schedule: ScheduleItem[];
  flights: Flight[];
  photos: string[];
};

// ----------------------------
// Helpers
// ----------------------------

function mapLink(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    address
  )}`;
}

function formatDT(date: string, time?: string) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  const day = dt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return time ? `${day} · ${time}` : day;
}

function byDateTime(a: ScheduleItem, b: ScheduleItem) {
  if (a.date === b.date) {
    const ta = a.time ?? "00:00";
    const tb = b.time ?? "00:00";
    return ta.localeCompare(tb);
  }
  return a.date.localeCompare(b.date);
}

function groupByDate(items: ScheduleItem[]) {
  return items.reduce<Record<string, ScheduleItem[]>>((acc, it) => {
    (acc[it.date] = acc[it.date] || []).push(it);
    return acc;
  }, {});
}

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// ----------------------------
// Default Data
// ----------------------------

const defaultData: TripData = {
  lodging: {
    barcelona: {
      link: "https://www.airbnb.com/l/ORgNzpnP?s=67&unique_share_id=38225666-7311-4745-ad81-1de9cc3e6db1",
      address:
        "Pg. de Gràcia, 65, L'Eixample, 08008 Barcelona, Spain",
    },
    ibiza: {
      link: "https://www.airbnb.com/l/N23haenG?s=67&unique_share_id=5f28dd9e-96de-41ee-81b2-9295d52dc05e",
      address:
        "Carrer del Pica-Soques, 34, 07817 Sant Josep de sa Talaia, Illes Balears, Spain",
    },
  },
  schedule: [
    // Barcelona
    { id: uid("sch"), date: "2025-08-30", title: "Night out (drinks)", area: "Barcelona", notes: "Evening" },
    { id: uid("sch"), date: "2025-08-31", time: "15:15", title: "Sagrada Família Tour", area: "Barcelona", location: "Sagrada Família", address: "Carrer de Mallorca, 401, 08013 Barcelona, Spain" },
    { id: uid("sch"), date: "2025-08-31", time: "17:00", title: "Fantasy Football Draft", area: "Barcelona", location: "Barcelona Airbnb", address: "Pg. de Gràcia, 65, L'Eixample, 08008 Barcelona, Spain", url: "https://www.airbnb.com/l/ORgNzpnP?s=67&unique_share_id=38225666-7311-4745-ad81-1de9cc3e6db1" },
    { id: uid("sch"), date: "2025-08-31", time: "20:00", title: "Watch FC Barcelona match at a bar", area: "Barcelona", location: "Bar (TBD)", notes: "After fantasy draft" },
    { id: uid("sch"), date: "2025-09-01", time: "16:00", title: "Paella Cooking Class", area: "Barcelona", location: "Cooking Class", address: "Carrer de Negrevernís, 30, 08034 Barcelona, Catalonia, Spain" },
    { id: uid("sch"), date: "2025-09-01", time: "21:30", title: "Flamenco Show @ 23 Robadors", area: "Barcelona", location: "23 Robadors", address: "Carrer d'en Robador, 23, 08001 Barcelona, Spain", url: "https://23robadors.com/", notes: "Programació flamenco — confirm start time on site" },
    { id: uid("sch"), date: "2025-09-02", time: "13:30", title: "Sailing", area: "Barcelona", location: "Marina", address: "Passeig de Joan de Borbó, 103, 08039 Barcelona, Catalonia, Spain" },
    { id: uid("sch"), date: "2025-09-02", time: "20:15", title: "Dinner: Bacaro", area: "Barcelona", address: "Carrer de Jerusalem, 6, 08001 Barcelona" },
    { id: uid("sch"), date: "2025-09-02", time: "22:30", title: "Drinks after dinner", area: "Barcelona", notes: "After Bacaro, late" },
    { id: uid("sch"), date: "2025-09-03", time: "10:00", title: "Commute to BCN Airport", area: "Barcelona", location: "Barcelona–El Prat (BCN)", address: "Aeropuerto de Barcelona-El Prat, 08820 El Prat de Llobregat, Barcelona, Spain" },
    { id: uid("sch"), date: "2025-09-03", time: "12:30", title: "Flight: Barcelona → Ibiza (FR3129)", area: "Barcelona", notes: "Arrive 13:40" },

    // Ibiza
    { id: uid("sch"), date: "2025-09-04", title: "Dinner: Ohana Ibiza", area: "Ibiza" },
    { id: uid("sch"), date: "2025-09-05", time: "17:00", title: "Calvin Harris @ Ushuaïa", area: "Ibiza", notes: "5–11 pm" },
    { id: uid("sch"), date: "2025-09-05", time: "23:30", title: "David Guetta @ UNVRS", area: "Ibiza", notes: "11:30 pm – sunrise" },
    { id: uid("sch"), date: "2025-09-06", title: "Chill day", area: "Ibiza" },
    { id: uid("sch"), date: "2025-09-07", title: "Fly out", area: "Ibiza" },
  ],
  flights: [
    { id: uid("flt"), traveler: "Anish + Sinha", from: "USA", to: "Barcelona", flight: "DL 128", date: "2025-08-30", arriveTime: "06:00", notes: "Arrive 6:00 am" },
    { id: uid("flt"), traveler: "Group", from: "Barcelona", to: "Ibiza", flight: "FR 3129", date: "2025-09-03", departTime: "12:30", arriveTime: "13:40", notes: "Ryanair" },
    { id: uid("flt"), traveler: "Group", from: "Ibiza", to: "Home", flight: "TBD", date: "2025-09-07", notes: "Add details" },
  ],
  photos: [],
};

// ----------------------------
// UI Components (helpers)
// ----------------------------

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-2xl bg-gradient-to-r from-[#da1212]/15 via-[#f1c40f]/15 to-[#a855f7]/15">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-xl font-semibold leading-tight">{title}</h2>
        {subtitle ? (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 items-center">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

function Badge({ area }: { area: "Barcelona" | "Ibiza" }) {
  const cls =
    area === "Barcelona"
      ? "bg-gradient-to-r from-[#da1212]/20 to-[#f1c40f]/20 text-foreground"
      : "bg-gradient-to-r from-[#00d0ff]/20 to-[#a855f7]/20 text-foreground";
  return <span className={`px-2 py-0.5 rounded-full text-xs ${cls}`}>{area}</span>;
}

// ----------------------------
// Main App
// ----------------------------

export default function TripApp() {
  const [data, setData] = useState<TripData>(defaultData);
  const [areaFilter, setAreaFilter] = useState<"All" | "Barcelona" | "Ibiza">(
    "All"
  );
  const [showAddresses, setShowAddresses] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: sched } = await supabase
        .from("schedule")
        .select()
        .order("date");
      const { data: flts } = await supabase
        .from("flights")
        .select()
        .order("date");
      const photos = await fetch("/api/photos")
        .then((r) => (r.ok ? r.json() : { photos: [] }))
        .then((r) => r.photos as string[]);
      setData((d) => ({
        ...d,
        schedule: (sched as ScheduleItem[]) || [],
        flights: (flts as Flight[]) || [],
        photos,
      }));
    }
    loadData();
  }, []);

  const scheduleSorted = useMemo(() => {
    const base = [...data.schedule].sort(byDateTime);
    return areaFilter === "All"
      ? base
      : base.filter((s) => s.area === areaFilter);
  }, [data.schedule, areaFilter]);

  const scheduleByDate = useMemo(
    () => groupByDate(scheduleSorted),
    [scheduleSorted]
  );

  async function addSchedule(it: Omit<ScheduleItem, "id">) {
    const item: ScheduleItem = { ...it, id: uid("sch") };
    const { error } = await supabase.from("schedule").insert(item);
    if (!error) {
      setData((d) => ({ ...d, schedule: [...d.schedule, item] }));
    }
  }
  async function updateSchedule(it: ScheduleItem) {
    const { error } = await supabase
      .from("schedule")
      .update(it)
      .eq("id", it.id);
    if (!error) {
      setData((d) => ({
        ...d,
        schedule: d.schedule.map((s) => (s.id === it.id ? it : s)),
      }));
    }
  }
  async function addFlight(f: Omit<Flight, "id">) {
    const item: Flight = { ...f, id: uid("flt") };
    const { error } = await supabase.from("flights").insert(item);
    if (!error) {
      setData((d) => ({ ...d, flights: [...d.flights, item] }));
    }
  }
  async function deleteFlight(id: string) {
    const { error } = await supabase.from("flights").delete().eq("id", id);
    if (!error) {
      setData((d) => ({ ...d, flights: d.flights.filter((x) => x.id !== id) }));
    }
  }
  async function handlePhotoUpload(files: FileList | null) {
    if (!files || !files.length) return;
    const uploadedUrls: string[] = [];

    await Promise.all(
      Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          // If the upload fails (e.g. missing Supabase config or RLS), fall back to a local preview
          uploadedUrls.push(URL.createObjectURL(file));
          return;
        }

        const { url } = await res.json();
        uploadedUrls.push(url);
      })
    );

    setData((d) => ({
      ...d,
      photos: [...d.photos, ...uploadedUrls],
    }));
  }

  return (
    <div
      className="min-h-screen text-foreground"
      style={{
        background:
          "linear-gradient(135deg, #fff 0%, #fff 35%, #fef6e6 35%, #fef6e6 50%, #f3e8ff 100%)",
      }}
    >
      {/* Hero */}
      <div className="w-full bg-gradient-to-r from-[#da1212] via-[#f1c40f] to-[#a855f7]">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
            Barcelona + Ibiza Trip
          </h1>
          <p className="text-white/90">
            Aug 30 – Sep 7, 2025 · All times local (Spain)
          </p>
        </div>
      </div>

      {data.photos.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {data.photos.slice(0, 6).map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`hero-${i}`}
                className="h-24 w-full object-cover rounded-xl"
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl">
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="h-4 w-4" /> Schedule
            </TabsTrigger>
            <TabsTrigger value="lodging" className="gap-2">
              <Home className="h-4 w-4" /> Lodging
            </TabsTrigger>
            <TabsTrigger value="flights" className="gap-2">
              <Plane className="h-4 w-4" /> Flights
            </TabsTrigger>
            <TabsTrigger value="photos" className="gap-2">
              <Image className="h-4 w-4" /> Photos
            </TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="mt-6">
            <Card className="shadow-sm border-2 border-[#f1c40f]/20">
              <CardHeader className="pb-3">
                <SectionHeader
                  icon={Calendar}
                  title="Agenda"
                  subtitle="Quick view of your plans"
                />
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Show Addresses</Label>
                    <Switch
                      checked={showAddresses}
                      onCheckedChange={setShowAddresses}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Filter</Label>
                    <Select
                      value={areaFilter}
                      onValueChange={(v: "All" | "Barcelona" | "Ibiza") => setAreaFilter(v)}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="Barcelona">Barcelona</SelectItem>
                        <SelectItem value="Ibiza">Ibiza</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="ml-auto">
                    <AddScheduleDialog onAdd={addSchedule} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(scheduleByDate).map(([date, items]) => (
                  <div key={date}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        {formatDT(date)}
                      </div>
                      <Separator className="flex-1" />
                    </div>
                    <div className="space-y-3">
                      {items.map((it) => (
                        <div
                          key={it.id}
                          className="p-3 md:p-4 rounded-2xl border flex flex-col md:flex-row md:items-center gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge area={it.area} />
                              {it.time ? <span>{it.time}</span> : null}
                            </div>
                            <div className="font-medium mt-1 break-words flex items-center gap-2">
                              <span>{it.title}</span>
                              {it.url ? (
                                <a
                                  href={it.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs underline inline-flex items-center gap-1"
                                >
                                  Open link <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : null}
                            </div>
                            {(it.location || it.address) && (
                              <div className="mt-1 text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                                {it.location ? (
                                  <span className="font-medium">{it.location}</span>
                                ) : null}
                                {showAddresses && it.address ? (
                                  <>
                                    <span>·</span>
                                    <a
                                      className="underline inline-flex items-center gap-1"
                                      href={mapLink(it.address)}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      <MapPin className="h-3 w-3" /> {it.address}
                                    </a>
                                    <CopyButton text={it.address} />
                                  </>
                                ) : null}
                              </div>
                            )}
                            {it.notes ? (
                              <div className="mt-1 text-xs text-muted-foreground">
                                {it.notes}
                              </div>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2 self-end md:self-center">
                            <EditScheduleDialog item={it} onSave={updateSchedule} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lodging Tab */}
          <TabsContent value="lodging" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-sm border-2 border-[#da1212]/15">
                <CardHeader className="pb-2">
                  <SectionHeader
                    icon={Home}
                    title="Barcelona"
                    subtitle="Aug 30 – Sep 3"
                  />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Row label="Airbnb">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        className="underline inline-flex items-center gap-1"
                        href={data.lodging.barcelona.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open listing <ExternalLink className="h-4 w-4" />
                      </a>
                      <CopyButton text={data.lodging.barcelona.link} />
                    </div>
                  </Row>
                  <Row label="Address">
                    <div className="space-y-2">
                      <div className="text-sm break-words">
                        {data.lodging.barcelona.address}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          className="underline inline-flex items-center gap-1"
                          href={mapLink(data.lodging.barcelona.address)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View on Maps <MapPin className="h-4 w-4" />
                        </a>
                        <CopyButton text={data.lodging.barcelona.address} />
                      </div>
                    </div>
                  </Row>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-2 border-[#a855f7]/15">
                <CardHeader className="pb-2">
                  <SectionHeader
                    icon={Home}
                    title="Ibiza"
                    subtitle="Sep 3 – Sep 7"
                  />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Row label="Airbnb">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        className="underline inline-flex items-center gap-1"
                        href={data.lodging.ibiza.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open listing <ExternalLink className="h-4 w-4" />
                      </a>
                      <CopyButton text={data.lodging.ibiza.link} />
                    </div>
                  </Row>
                  <Row label="Address">
                    <div className="space-y-2">
                      <div className="text-sm break-words">
                        {data.lodging.ibiza.address}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          className="underline inline-flex items-center gap-1"
                          href={mapLink(data.lodging.ibiza.address)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View on Maps <MapPin className="h-4 w-4" />
                        </a>
                        <CopyButton text={data.lodging.ibiza.address} />
                      </div>
                    </div>
                  </Row>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Flights Tab */}
          <TabsContent value="flights" className="mt-6">
            <Card className="shadow-sm border-2 border-[#00d0ff]/15">
              <CardHeader className="pb-3">
                <SectionHeader
                  icon={Plane}
                  title="Flight Information"
                  subtitle="Add everyone’s flights"
                />
                <div className="ml-auto">
                  <AddFlightDialog onAdd={addFlight} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="overflow-x-auto rounded-2xl border">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr className="text-left">
                        <th className="p-3">Traveler</th>
                        <th className="p-3">From</th>
                        <th className="p-3">To</th>
                        <th className="p-3">Flight</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Dep</th>
                        <th className="p-3">Arr</th>
                        <th className="p-3">Notes</th>
                        <th className="p-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.flights.map((f) => (
                        <tr key={f.id} className="border-t">
                          <td className="p-3 whitespace-nowrap">{f.traveler}</td>
                          <td className="p-3 whitespace-nowrap">{f.from}</td>
                          <td className="p-3 whitespace-nowrap">{f.to}</td>
                          <td className="p-3 whitespace-nowrap">{f.flight}</td>
                          <td className="p-3 whitespace-nowrap">{f.date}</td>
                          <td className="p-3 whitespace-nowrap">
                            {f.departTime ?? "—"}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {f.arriveTime ?? "—"}
                          </td>
                          <td className="p-3">{f.notes ?? ""}</td>
                          <td className="p-3 text-right">
                            <DeleteFlightButton onDelete={() => deleteFlight(f.id)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="mt-6">
            <Card className="shadow-sm border-2 border-[#a855f7]/15">
              <CardHeader className="pb-3">
                <SectionHeader
                  icon={Image}
                  title="Group Photos"
                  subtitle="Add your favorite shots"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={async (e) => {
                      await handlePhotoUpload(e.target.files);
                      // Allow selecting the same file again later
                      e.target.value = "";
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {data.photos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No photos yet. Use the file picker above to add the ones you
                    shared.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {data.photos.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`trip-${i}`}
                        className="rounded-xl w-full h-48 object-cover"
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ----------------------------
// Dialogs & Widgets
// ----------------------------

function AddScheduleDialog({
  onAdd,
}: {
  onAdd: (it: Omit<ScheduleItem, "id">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [area, setArea] = useState<"Barcelona" | "Ibiza">("Barcelona");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  function clear() {
    setArea("Barcelona");
    setDate("");
    setTime("");
    setTitle("");
    setLocation("");
    setAddress("");
    setNotes("");
  }

  function handleAdd() {
    if (!date || !title) return;
    onAdd({
      area,
      date,
      time: time || undefined,
      title,
      location: location || undefined,
      address: address || undefined,
      notes: notes || undefined,
    });
    clear();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl">
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add schedule item</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Row label="Area">
            <Select value={area} onValueChange={(v: "Barcelona" | "Ibiza") => setArea(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Barcelona">Barcelona</SelectItem>
                <SelectItem value="Ibiza">Ibiza</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Date">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Row>
          <Row label="Time">
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </Row>
          <Row label="Title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Dinner: Bacaro"
            />
          </Row>
          <Row label="Location">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Bacaro"
            />
          </Row>
          <Row label="Address">
            <AddressInput
              value={address}
              onChange={setAddress}
              placeholder="Start typing an address..."
            />
          </Row>
          <Row label="Notes">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything to remember"
            />
          </Row>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => { clear(); setOpen(false); }}>
            Cancel
          </Button>
          <Button className="rounded-2xl" onClick={handleAdd}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditScheduleDialog({
  item,
  onSave,
}: {
  item: ScheduleItem;
  onSave: (it: ScheduleItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [area, setArea] = useState<"Barcelona" | "Ibiza">(item.area);
  const [date, setDate] = useState(item.date);
  const [time, setTime] = useState(item.time || "");
  const [title, setTitle] = useState(item.title);
  const [location, setLocation] = useState(item.location || "");
  const [address, setAddress] = useState(item.address || "");
  const [notes, setNotes] = useState(item.notes || "");

  function handleSave() {
    if (!date || !title) return;
    onSave({
      ...item,
      area,
      date,
      time: time || undefined,
      title,
      location: location || undefined,
      address: address || undefined,
      notes: notes || undefined,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-full"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit schedule item</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Row label="Area">
            <Select value={area} onValueChange={(v: "Barcelona" | "Ibiza") => setArea(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Barcelona">Barcelona</SelectItem>
                <SelectItem value="Ibiza">Ibiza</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row label="Date">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Row>
          <Row label="Time">
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </Row>
          <Row label="Title">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Row>
          <Row label="Location">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Row>
          <Row label="Address">
            <AddressInput
              value={address}
              onChange={setAddress}
              placeholder="Start typing an address..."
            />
          </Row>
          <Row label="Notes">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Row>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className="rounded-2xl" onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddFlightDialog({
  onAdd,
}: {
  onAdd: (f: Omit<Flight, "id">) => void;
}) {
  const [traveler, setTraveler] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [flight, setFlight] = useState("");
  const [date, setDate] = useState("");
  const [departTime, setDepartTime] = useState("");
  const [arriveTime, setArriveTime] = useState("");
  const [notes, setNotes] = useState("");

  function clear() {
    setTraveler("");
    setFrom("");
    setTo("");
    setFlight("");
    setDate("");
    setDepartTime("");
    setArriveTime("");
    setNotes("");
  }

  function handleAdd(close: () => void) {
    if (!traveler || !from || !to || !flight || !date) return;
    onAdd({
      traveler,
      from,
      to,
      flight,
      date,
      departTime: departTime || undefined,
      arriveTime: arriveTime || undefined,
      notes: notes || undefined,
    });
    clear();
    close();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-2xl">
          <Plus className="h-4 w-4 mr-2" /> Add Flight
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>Add a flight</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label>Traveler</Label>
            <Input
              value={traveler}
              onChange={(e) => setTraveler(e.target.value)}
              placeholder="e.g., Anish"
            />
          </div>
          <div>
            <Label>Flight #</Label>
            <Input
              value={flight}
              onChange={(e) => setFlight(e.target.value)}
              placeholder="e.g., DL 128"
            />
          </div>
          <div>
            <Label>From</Label>
            <Input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="City or Airport"
            />
          </div>
          <div>
            <Label>To</Label>
            <Input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="City or Airport"
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <Label>Depart</Label>
            <Input
              type="time"
              value={departTime}
              onChange={(e) => setDepartTime(e.target.value)}
            />
          </div>
          <div>
            <Label>Arrive</Label>
            <Input
              type="time"
              value={arriveTime}
              onChange={(e) => setArriveTime(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Check-in closes 45m before dep"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button variant="secondary" onClick={clear}>
              Cancel
            </Button>
          </DialogTrigger>
          <DialogCloseButton onConfirm={handleAdd}>Add</DialogCloseButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CopyButton({ text }: { text: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 rounded-xl"
      onClick={() => navigator.clipboard.writeText(text)}
    >
      <Copy className="h-4 w-4 mr-1" /> Copy
    </Button>
  );
}

function DeleteFlightButton({ onDelete }: { onDelete: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onDelete}>
      Remove
    </Button>
  );
}

// Address suggestions for Barcelona and Ibiza
const ADDRESS_SUGGESTIONS = [
  // Barcelona
  "Sagrada Família, Barcelona, Spain",
  "Park Güell, Barcelona, Spain", 
  "Las Ramblas, Barcelona, Spain",
  "Pg. de Gràcia, Barcelona, Spain",
  "Carrer de Mallorca, Barcelona, Spain",
  "Plaça Catalunya, Barcelona, Spain",
  "Gothic Quarter, Barcelona, Spain",
  "Barceloneta Beach, Barcelona, Spain",
  "Camp Nou, Barcelona, Spain",
  "Passeig de Joan de Borbó, Barcelona, Spain",
  // Ibiza
  "Playa d'en Bossa, Ibiza, Spain",
  "San Antonio, Ibiza, Spain", 
  "Ibiza Town, Ibiza, Spain",
  "Es Vedra, Ibiza, Spain",
  "Cala Comte, Ibiza, Spain",
  "Ushuaïa Ibiza Beach Hotel, Ibiza, Spain",
  "Pacha Ibiza, Ibiza, Spain",
  "Amnesia Ibiza, Ibiza, Spain",
  "DC10 Ibiza, Ibiza, Spain",
  "Café del Mar, Ibiza, Spain"
];

function AddressInput({ 
  value, 
  onChange, 
  placeholder = "Start typing an address..." 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    if (inputValue.length > 2) {
      const filtered = ADDRESS_SUGGESTIONS.filter(address =>
        address.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 5); // Show max 5 suggestions
      setFilteredSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        onFocus={() => {
          if (value.length > 2 && filteredSuggestions.length > 0) {
            setIsOpen(true);
          }
        }}
        onBlur={() => {
          // Delay closing to allow click on suggestions
          setTimeout(() => setIsOpen(false), 200);
        }}
      />
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-900 border-b last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{suggestion}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DialogCloseButton({
  onConfirm,
  children,
}: {
  onConfirm: (close: () => void) => void;
  children: React.ReactNode;
}) {
  return (
    <DialogTrigger asChild>
      <Button
        className="rounded-2xl"
        onClick={(e) => {
          e.preventDefault();
          const close = () => {
            // Find the dialog close button and click it
            const closeButton = document.querySelector('[data-state="open"] button[aria-label="Close"]');
            if (closeButton) {
              (closeButton as HTMLElement).click();
            }
          };
          onConfirm(close);
        }}
      >
        {children}
      </Button>
    </DialogTrigger>
  );
}
