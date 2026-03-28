"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Search, ChevronUp, ChevronDown } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

interface ArtistOption {
  id: string;
  name: string;
  profile_image_url: string | null;
}

export default function ArtistMultiSelect({
  selectedIds,
  onChange,
  label,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}) {
  const [allArtists, setAllArtists] = useState<ArtistOption[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/artists?all=true");
      if (res.ok) {
        const data = await res.json();
        setAllArtists(data);
      }
      setLoaded(true);
    }
    load();
  }, []);

  const updateDropdownPosition = useCallback(() => {
    if (inputWrapperRef.current) {
      const rect = inputWrapperRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener("scroll", updateDropdownPosition, true);
      window.addEventListener("resize", updateDropdownPosition);
      return () => {
        window.removeEventListener("scroll", updateDropdownPosition, true);
        window.removeEventListener("resize", updateDropdownPosition);
      };
    }
  }, [isOpen, updateDropdownPosition]);

  const selectedArtists = selectedIds
    .map((id) => allArtists.find((a) => a.id === id))
    .filter(Boolean) as ArtistOption[];

  const filteredArtists = allArtists.filter(
    (a) => !selectedIds.includes(a.id) && a.name.toLowerCase().includes(search.toLowerCase())
  );

  function addArtist(id: string) {
    onChange([...selectedIds, id]);
    setSearch("");
    inputRef.current?.focus();
  }

  function removeArtist(id: string) {
    onChange(selectedIds.filter((i) => i !== id));
  }

  function moveArtist(index: number, direction: -1 | 1) {
    const newIds = [...selectedIds];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newIds.length) return;
    [newIds[index], newIds[newIndex]] = [newIds[newIndex], newIds[index]];
    onChange(newIds);
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-xs font-display font-bold uppercase tracking-widest text-cobalt/60">
          {label}
        </label>
      )}

      {/* Selected artists */}
      {selectedArtists.length > 0 && (
        <div className="space-y-2">
          {selectedArtists.map((artist, i) => (
            <div
              key={artist.id}
              className="flex items-center gap-3 bg-cobalt/5 rounded-xl px-3 py-2.5"
            >
              <div className="flex flex-col flex-shrink-0">
                <button
                  type="button"
                  onClick={() => moveArtist(i, -1)}
                  disabled={i === 0}
                  className="p-0.5 text-cobalt/20 hover:text-cobalt disabled:opacity-20 transition-colors"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveArtist(i, 1)}
                  disabled={i === selectedIds.length - 1}
                  className="p-0.5 text-cobalt/20 hover:text-cobalt disabled:opacity-20 transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <Avatar src={artist.profile_image_url} alt={artist.name} size="sm" />
              <span className="font-body text-sm text-cobalt flex-1">{artist.name}</span>
              <span className="text-[10px] font-display font-bold uppercase tracking-widest text-cobalt/30">
                {i === 0 ? "Primary" : "Featured"}
              </span>
              <button
                type="button"
                onClick={() => removeArtist(artist.id)}
                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div ref={inputWrapperRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cobalt/30" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={loaded ? "Search artists to add..." : "Loading artists..."}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-cobalt/10 bg-white text-sm font-body text-cobalt focus:outline-none focus:border-accent placeholder:text-cobalt/30 transition-all"
          />
        </div>
      </div>

      {/* Dropdown (rendered as fixed portal to avoid overflow clipping) */}
      {isOpen && loaded && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
          <div
            style={dropdownStyle}
            className="bg-white rounded-2xl border-2 border-cobalt/10 shadow-2xl max-h-60 overflow-y-auto"
          >
            {filteredArtists.length === 0 ? (
              <p className="px-4 py-4 text-sm text-cobalt/30 font-body text-center">
                {search ? `No artists matching "${search}"` : "All artists have been added"}
              </p>
            ) : (
              filteredArtists.map((artist) => (
                <button
                  key={artist.id}
                  type="button"
                  onClick={() => addArtist(artist.id)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-accent/5 transition-colors w-full text-left border-b border-cobalt/5 last:border-0"
                >
                  <Avatar src={artist.profile_image_url} alt={artist.name} size="sm" />
                  <span className="text-sm font-body text-cobalt font-medium">{artist.name}</span>
                </button>
              ))
            )}
          </div>
        </>
      )}

      {selectedIds.length === 0 && (
        <p className="text-[10px] text-cobalt/30 font-body">Click the search box and select artists from your roster.</p>
      )}
      {selectedIds.length > 0 && (
        <p className="text-[10px] text-cobalt/30 font-body">First artist is primary. Use arrows to reorder.</p>
      )}
    </div>
  );
}
