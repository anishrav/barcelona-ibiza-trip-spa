"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
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

export function EditScheduleDialog({
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
