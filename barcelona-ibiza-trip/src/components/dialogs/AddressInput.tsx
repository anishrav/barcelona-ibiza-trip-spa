"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";

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

export function AddressInput({ 
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
