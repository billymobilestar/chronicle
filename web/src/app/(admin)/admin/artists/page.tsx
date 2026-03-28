"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { Plus, Pencil, Key } from "lucide-react";
import type { Artist } from "@/lib/types";

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchArtists();
  }, []);

  async function fetchArtists() {
    const supabase = getSupabaseBrowser();
    const { data } = await supabase
      .from("artists")
      .select("*")
      .order("name");
    setArtists(data || []);
    setLoading(false);
  }

  async function createArtistLogin() {
    if (!selectedArtist || !loginEmail || !loginPassword) return;
    setCreating(true);

    const res = await fetch("/api/admin/create-artist-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artist_id: selectedArtist.id,
        email: loginEmail,
        password: loginPassword,
        display_name: selectedArtist.name,
      }),
    });

    if (res.ok) {
      setCreatedCredentials({ email: loginEmail, password: loginPassword });
      toast("Artist login created!");
      fetchArtists();
    } else {
      const data = await res.json();
      toast(data.error || "Failed to create login", "error");
    }
    setCreating(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cobalt">Artists</h1>
          <p className="text-gray-500 text-sm">Manage Chronicle Records artists</p>
        </div>
        <Link href="/admin/artists/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Artist
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" /></div>
      ) : artists.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400">No artists yet. Add your first artist!</p>
        </div>
      ) : (
        <div className="card-editorial table-scroll">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Artist</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Genre</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Login</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((artist) => (
                <tr key={artist.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={artist.profile_image_url} alt={artist.name} size="sm" />
                      <div>
                        <p className="font-medium text-cobalt">{artist.name}</p>
                        <p className="text-xs text-gray-400">/{artist.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{artist.genre || "-"}</td>
                  <td className="px-6 py-4">
                    <Badge variant={artist.is_active ? "success" : "danger"}>
                      {artist.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    {artist.user_id ? (
                      <Badge variant="success">Has Login</Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedArtist(artist);
                          setLoginEmail("");
                          setLoginPassword("");
                          setCreatedCredentials(null);
                          setShowLoginModal(true);
                        }}
                      >
                        <Key className="w-3.5 h-3.5 mr-1" />
                        Create
                      </Button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/admin/artists/${artist.id}`}>
                      <Button variant="ghost" size="sm">
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Login Modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title={`Create Login for ${selectedArtist?.name}`}
      >
        {createdCredentials ? (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-xl">
              <p className="text-green-700 font-semibold mb-2">Login created!</p>
              <p className="text-sm text-green-600">Share these credentials with the artist:</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl font-mono text-sm space-y-1">
              <p>Email: {createdCredentials.email}</p>
              <p>Password: {createdCredentials.password}</p>
            </div>
            <Button onClick={() => setShowLoginModal(false)} className="w-full">Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              id="loginEmail"
              label="Email for Artist"
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="artist@example.com"
            />
            <Input
              id="loginPassword"
              label="Temporary Password"
              type="text"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Min 6 characters"
            />
            <Button
              onClick={createArtistLogin}
              loading={creating}
              disabled={!loginEmail || loginPassword.length < 6}
              className="w-full"
            >
              Create Login
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
