"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import { Flight } from "@/types/trip";

export function AddFlightDialog({
  onAdd,
}: {
  onAdd: (f: Omit<Flight, "id">) => void;
}) {
  const [open, setOpen] = useState(false);
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

  function handleAdd() {
    if (!traveler || !from || !to || !flight || !date) return;
    onAdd({
      traveler,
      from,
      to,
      flight,
      date,
      departtime: departTime || undefined,
      arrivetime: arriveTime || undefined,
      notes: notes || undefined,
    });
    clear();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <Button variant="secondary" onClick={() => { clear(); setOpen(false); }}>
            Cancel
          </Button>
          <Button className="rounded-2xl" onClick={handleAdd}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditFlightDialog({
  flight,
  onSave,
}: {
  flight: Flight;
  onSave: (flight: Flight) => void;
}) {
  const [open, setOpen] = useState(false);
  const [traveler, setTraveler] = useState(flight.traveler);
  const [from, setFrom] = useState(flight.from);
  const [to, setTo] = useState(flight.to);
  const [flightNumber, setFlightNumber] = useState(flight.flight);
  const [date, setDate] = useState(flight.date);
  const [departTime, setDepartTime] = useState(flight.departtime || "");
  const [arriveTime, setArriveTime] = useState(flight.arrivetime || "");
  const [notes, setNotes] = useState(flight.notes || "");

  function handleSave() {
    if (!traveler || !from || !to || !flightNumber || !date) return;
    onSave({
      ...flight,
      traveler,
      from,
      to,
      flight: flightNumber,
      date,
      departtime: departTime || undefined,
      arrivetime: arriveTime || undefined,
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
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>Edit flight</DialogTitle>
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
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
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
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button className="rounded-2xl" onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteFlightButton({ onDelete }: { onDelete: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onDelete}>
      Remove
    </Button>
  );
}
