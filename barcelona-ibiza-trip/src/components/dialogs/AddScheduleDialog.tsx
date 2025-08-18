"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ScheduleItem } from "@/types/trip";
import { AddressInput } from "./AddressInput";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 items-center">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

export function AddScheduleDialog({
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
