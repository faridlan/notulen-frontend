import React, { useState } from "react";

interface Props {
  value: string[];
  onChange: (members: string[]) => void;
  label?: string;
}

export default function TagInput({ value, onChange, label }: Props) {
  const [input, setInput] = useState("");

  function addMember() {
    const name = input.trim();
    if (!name) return;
    if (value.includes(name)) return; // prevent duplicates

    onChange([...value, name]);
    setInput("");
  }

  function removeMember(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addMember();
    }
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}

      {/* TAG LIST */}
      <div className="flex flex-wrap gap-2 bg-gray-50 p-3 rounded-lg border">
        {value.map((name, idx) => (
          <div
            key={idx}
            className="
              px-2 py-1 
              bg-blue-100 
              text-blue-700 
              rounded-lg 
              flex items-center gap-1 
              text-xs font-medium
            "
          >
            {name}
            <button
              onClick={() => removeMember(idx)}
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* INPUT + BUTTON */}
      <div className="flex gap-2">
        <input
          className="border rounded w-full px-3 py-2 text-sm"
          placeholder="Add Partisipant"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          onClick={addMember}
          className="
            px-3 py-2 
            bg-blue-600 hover:bg-blue-700 
            text-white rounded 
            text-sm
          "
        >
          Tambah
        </button>
      </div>
    </div>
  );
}
