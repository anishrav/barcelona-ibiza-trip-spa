"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Calendar, ExternalLink, Home, MapPin, Plane, Image } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { TripData, ScheduleItem, Flight } from "@/types/trip";
import { mapLink, formatTime, formatDT, byDateTime, groupByDate, uid } from "@/utils/trip-utils";
import { SectionHeader, Badge } from "@/components/ui/SectionHeader";
import { AddScheduleDialog } from "@/components/dialogs/AddScheduleDialog";
import { EditScheduleDialog } from "@/components/dialogs/EditScheduleDialog";
import { AddFlightDialog, EditFlightDialog, DeleteFlightButton } from "@/components/dialogs/FlightDialogs";

export default function TripApp() {
  const [data, setData] = useState<TripData>({
    lodging: {
      barcelona: {
        link: "https://www.airbnb.com/l/ORgNzpnP?s=67&unique_share_id=38225666-7311-4745-ad81-1de9cc3e6db1",
        address: "Pg. de Gràcia, 65, L'Eixample, 08008 Barcelona, Spain",
      },
      ibiza: {
        link: "https://www.airbnb.com/l/N23haenG?s=67&unique_share_id=5f28dd9e-96de-41ee-81b2-9295d52dc05e",
        address: "Carrer del Pica-Soques, 34, 07817 Sant Josep de sa Talaia, Illes Balears, Spain",
      },
    },
    schedule: [],
    flights: [],
    photos: [],
  });
  const [areaFilter, setAreaFilter] = useState<"All" | "Barcelona" | "Ibiza">("All");
  const [showAddresses, setShowAddresses] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: sched } = await supabase.from("schedule").select().order("date");
      const { data: flts } = await supabase.from("flights").select().order("date");
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

  // Generate virtual schedule items from flights
  const flightScheduleItems = useMemo(() => {
    const items: ScheduleItem[] = [];
    
    data.flights.forEach(flight => {
      // Arrival flights (8/29 or 8/30 departure, but always show arrival on 8/30)
      if ((flight.date === "2025-08-29" || flight.date === "2025-08-30") && flight.arrivetime && flight.to == "BCN") {
        items.push({
          id: `flight-arrival-${flight.id}`,
          date: "2025-08-30", // Always show arrival on Aug 30
          time: flight.arrivetime,
          title: `✈️ ${flight.traveler} arrive(s) on ${flight.flight} from ${flight.from}`,
          area: "Barcelona",
          location: "Barcelona Airport",
          address: "Aeropuerto de Barcelona-El Prat",
          notes: `${flight.traveler} arrives from ${flight.from}${flight.notes ? ` - ${flight.notes}` : ""}`
        });
      }
      
      // Departure on Sep 7
      if (flight.date === "2025-09-07" && flight.departtime && flight.from == "IBZ") {
        items.push({
          id: `flight-departure-${flight.id}`,
          date: flight.date,
          time: flight.departtime,
          title: `✈️ ${flight.traveler} depart(s) on ${flight.flight} to ${flight.to}`,
          area: "Ibiza",
          location: "Ibiza Airport",
          address: "Aeropuerto de Ibiza, 07818 Sant Josep de sa Talaia, Illes Balears, Spain",
          notes: `${flight.traveler} departs to ${flight.to}${flight.notes ? ` - ${flight.notes}` : ""}`
        });
      }
    });
    
    return items;
  }, [data.flights]);

  const scheduleSorted = useMemo(() => {
    // Combine actual schedule with virtual flight schedule items
    const combined = [...data.schedule, ...flightScheduleItems].sort(byDateTime);
    return areaFilter === "All" ? combined : combined.filter((s) => s.area === areaFilter);
  }, [data.schedule, flightScheduleItems, areaFilter]);

  const scheduleByDate = useMemo(() => groupByDate(scheduleSorted), [scheduleSorted]);

  // Data manipulation functions
  async function addSchedule(it: Omit<ScheduleItem, "id">) {
    const item: ScheduleItem = { ...it, id: uid("sch") };
    const { error } = await supabase.from("schedule").insert(item);
    if (!error) {
      setData((d) => ({ ...d, schedule: [...d.schedule, item] }));
    }
  }

  async function updateSchedule(it: ScheduleItem) {
    const { error } = await supabase.from("schedule").update(it).eq("id", it.id);
    if (!error) {
      setData((d) => ({
        ...d,
        schedule: d.schedule.map((s) => (s.id === it.id ? it : s)),
      }));
    }
  }

  async function addFlight(f: Omit<Flight, "id">) {
    console.log("addFlight called with:", f);
    const item: Flight = { ...f, id: uid("flt") };
    const { error } = await supabase.from("flights").insert(item);
    console.log("Supabase insert result:", { error, item });
    if (!error) {
      setData((d) => ({ ...d, flights: [...d.flights, item] }));
      console.log("Flight added successfully");
    } else {
      console.error("Failed to add flight:", error);
    }
  }

  async function updateFlight(flight: Flight) {
    const { error } = await supabase.from("flights").update(flight).eq("id", flight.id);
    if (!error) {
      setData((d) => ({
        ...d,
        flights: d.flights.map((f) => (f.id === flight.id ? flight : f)),
      }));
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
        background: "linear-gradient(135deg, #fff 0%, #fff 35%, #fef6e6 35%, #fef6e6 50%, #f3e8ff 100%)",
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
                <SectionHeader icon={Calendar} title="Agenda" subtitle="Quick view of your plans" />
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Show Addresses</Label>
                    <Switch checked={showAddresses} onCheckedChange={setShowAddresses} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Filter</Label>
                    <Select value={areaFilter} onValueChange={(v: "All" | "Barcelona" | "Ibiza") => setAreaFilter(v)}>
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
                              {it.time ? <span>{formatTime(it.time)}</span> : null}
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
                            {!it.id.startsWith('flight-') && (
                              <EditScheduleDialog item={it} onSave={updateSchedule} />
                            )}
                            {it.id.startsWith('flight-') && (
                              <div className="text-xs text-muted-foreground px-2">
                                From flight data
                              </div>
                            )}
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
                  <SectionHeader icon={Home} title="Barcelona" subtitle="Aug 30 – Sep 3" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 items-center">
                    <Label className="text-sm text-muted-foreground">Airbnb</Label>
                    <div className="col-span-2">
                      <a
                        className="underline inline-flex items-center gap-1"
                        href={data.lodging.barcelona.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open listing <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 items-center">
                    <Label className="text-sm text-muted-foreground">Address</Label>
                    <div className="col-span-2 space-y-2">
                      <div className="text-sm break-words">
                        {data.lodging.barcelona.address}
                      </div>
                      <a
                        className="underline inline-flex items-center gap-1"
                        href={mapLink(data.lodging.barcelona.address)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View on Maps <MapPin className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-2 border-[#a855f7]/15">
                <CardHeader className="pb-2">
                  <SectionHeader icon={Home} title="Ibiza" subtitle="Sep 3 – Sep 7" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 items-center">
                    <Label className="text-sm text-muted-foreground">Airbnb</Label>
                    <div className="col-span-2">
                      <a
                        className="underline inline-flex items-center gap-1"
                        href={data.lodging.ibiza.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open listing <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 items-center">
                    <Label className="text-sm text-muted-foreground">Address</Label>
                    <div className="col-span-2 space-y-2">
                      <div className="text-sm break-words">
                        {data.lodging.ibiza.address}
                      </div>
                      <a
                        className="underline inline-flex items-center gap-1"
                        href={mapLink(data.lodging.ibiza.address)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View on Maps <MapPin className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Flights Tab */}
          <TabsContent value="flights" className="mt-6">
            <Card className="shadow-sm border-2 border-[#00d0ff]/15">
              <CardHeader className="pb-3">
                <SectionHeader icon={Plane} title="Flight Information" subtitle="Add everyone's flights" />
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
                            {f.departtime ? formatTime(f.departtime) : "—"}
                          </td>
                          <td className="p-3 whitespace-nowrap">
                            {f.arrivetime ? formatTime(f.arrivetime) : "—"}
                          </td>
                          <td className="p-3">{f.notes ?? ""}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <EditFlightDialog flight={f} onSave={updateFlight} />
                              <DeleteFlightButton onDelete={() => deleteFlight(f.id)} />
                            </div>
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
                <SectionHeader icon={Image} title="Group Photos" subtitle="Add your favorite shots" />
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={async (e) => {
                      await handlePhotoUpload(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {data.photos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No photos yet. Use the file picker above to add the ones you shared.
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