"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/lib/types/database";
import { User, Edit, Check, X, Briefcase, DollarSign, Award, Star } from "lucide-react";

export default function ProfessionalProfilePage() {
  const { user, role, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    bio: "",
    date_of_birth: "",
    experience_years: "",
    hourly_rate: "",
    skills: [] as string[],
    newSkill: "",
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        window.location.href = "/login";
        return;
      }
      // Check if user has professional role
      if (role !== "professional") {
        // Redirect based on actual role
        if (role === "admin") {
          window.location.href = "/admin/dashboard";
        } else if (role === "customer") {
          window.location.href = "/customer/dashboard";
        } else {
          window.location.href = "/login?error=unauthorized";
        }
        return;
      }
      fetchProfileData();
    }
  }, [user, role, authLoading]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const supabase = createClient();

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setProfileForm({
          full_name: profileData.full_name || "",
          phone: profileData.phone || "",
          bio: profileData.bio || "",
          date_of_birth: profileData.date_of_birth || "",
          experience_years: profileData.experience_years?.toString() || "",
          hourly_rate: profileData.hourly_rate?.toString() || "",
          skills: profileData.skills || [],
          newSkill: "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          bio: profileForm.bio || null,
          date_of_birth: profileForm.date_of_birth || null,
          experience_years: profileForm.experience_years
            ? parseInt(profileForm.experience_years)
            : null,
          hourly_rate: profileForm.hourly_rate ? parseFloat(profileForm.hourly_rate) : null,
          skills: profileForm.skills.length > 0 ? profileForm.skills : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setEditingProfile(false);
      fetchProfileData();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (profileForm.newSkill.trim() && !profileForm.skills.includes(profileForm.newSkill.trim())) {
      setProfileForm({
        ...profileForm,
        skills: [...profileForm.skills, profileForm.newSkill.trim()],
        newSkill: "",
      });
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfileForm({
      ...profileForm,
      skills: profileForm.skills.filter((s) => s !== skill),
    });
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user || role !== "professional") {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Professional Profile</h1>

      {/* Profile Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Manage your professional profile</CardDescription>
            </div>
            {!editingProfile ? (
              <Button variant="outline" onClick={() => setEditingProfile(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditingProfile(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} disabled={saving}>
                  <Check className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingProfile ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input
                  value={profileForm.full_name}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, full_name: e.target.value }))
                  }
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth</label>
                <Input
                  type="date"
                  value={profileForm.date_of_birth}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, date_of_birth: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  placeholder="Tell us about yourself and your services..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Experience (Years)
                </label>
                <Input
                  type="number"
                  value={profileForm.experience_years}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, experience_years: e.target.value }))
                  }
                  placeholder="e.g., 5"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Hourly Rate ($)
                </label>
                <Input
                  type="number"
                  value={profileForm.hourly_rate}
                  onChange={(e) =>
                    setProfileForm((prev) => ({ ...prev, hourly_rate: e.target.value }))
                  }
                  placeholder="e.g., 25.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={profileForm.newSkill}
                    onChange={(e) =>
                      setProfileForm((prev) => ({ ...prev, newSkill: e.target.value }))
                    }
                    placeholder="Add a skill"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddSkill}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profileForm.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="h-20 w-20 rounded-full"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-10 w-10 text-blue-600" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{profile?.full_name || "Not set"}</h2>
                  {profile?.rating_average > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{profile.rating_average.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">
                        ({profile.total_reviews} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold">{user?.email || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold">{profile?.phone || "Not set"}</p>
                </div>
                {profile?.date_of_birth && (
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-semibold">
                      {new Date(profile.date_of_birth).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {profile?.experience_years && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      Experience
                    </p>
                    <p className="font-semibold">{profile.experience_years} years</p>
                  </div>
                )}
                {profile?.hourly_rate && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Hourly Rate
                    </p>
                    <p className="font-semibold">${profile.hourly_rate.toFixed(2)}/hr</p>
                  </div>
                )}
              </div>

              {profile?.bio && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Bio</p>
                  <p className="font-semibold">{profile.bio}</p>
                </div>
              )}

              {profile?.skills && profile.skills.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">Verification Status</p>
                <Badge
                  variant={profile?.is_verified ? "default" : "secondary"}
                  className="mt-1"
                >
                  {profile?.is_verified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
