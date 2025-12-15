// ./src/app/employee-profile/self-demo/page.tsx

"use client";

import { useState, useEffect } from "react";
import {api} from "@/lib/axios";
import {
  EmployeeProfile,
  SelfServiceUpdateProfileDto,
  Address,
} from "@/types/employeeProfile";
import BackButton from "@/components/BackButton";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function SelfServiceProfileDemoPage() {
  const [employeeId, setEmployeeId] = useState("");
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [form, setForm] = useState<SelfServiceUpdateProfileDto>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(id);
  }, [message]);

  async function loadProfile() {
    if (!employeeId) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await api.get<EmployeeProfile>(
        `/employee-profile/${employeeId}/self`
      );
      setProfile(res.data);
      setForm({
        personalEmail: res.data.personalEmail,
        mobilePhone: res.data.mobilePhone,
        homePhone: res.data.homePhone,
        biography: res.data.biography,
        address: res.data.address as Address,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1] as keyof Address;
      setForm((prev) => ({
        ...prev,
        address: {
          ...(prev.address || {}),
          [field]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId) return;
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await api.patch<EmployeeProfile>(
        `/employee-profile/${employeeId}/self`,
        form
      );
      setProfile(res.data);
      setMessage("Profile updated successfully.");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute allowRoles={["Employee", "Manager"]}>
    <main style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
            <BackButton />
      <h1>Self-Service Profile (Demo)</h1>
      <p>Paste an existing employee profile Mongo _id for now.</p>

      <div style={{ display: "flex", gap: "0.8rem", marginTop: "1rem" }}>
        <input
          placeholder="EmployeeProfile Mongo _id"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />
        <button onClick={loadProfile} disabled={loading}>
          {loading ? "Loading..." : "Load Profile"}
        </button>
      </div>

      {error && (
        <p style={{ color: "red", marginTop: "1rem" }}>
          Error: {Array.isArray(error) ? error.join(", ") : error}
        </p>
      )}
      {message && (
        <div className="toast">
          <span>✅</span>
          <span>{message}</span>
        </div>
        )}

      {profile && (
        <form
          onSubmit={handleSave}
          style={{ display: "grid", gap: "0.8rem", marginTop: "1.5rem" }}
        >
          <h2>Editable Fields</h2>

          <div>
            <label>Personal Email</label>
            <input
              name="personalEmail"
              value={form.personalEmail || ""}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: "flex", gap: "0.8rem" }}>
            <div style={{ flex: 1 }}>
              <label>Mobile Phone</label>
              <input
                name="mobilePhone"
                value={form.mobilePhone || ""}
                onChange={handleChange}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Home Phone</label>
              <input
                name="homePhone"
                value={form.homePhone || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label>Biography</label>
            <textarea
              name="biography"
              rows={3}
              value={form.biography || ""}
              onChange={handleChange}
            />
          </div>

          <h3>Address</h3>
          <div style={{ display: "flex", gap: "0.8rem" }}>
            <div style={{ flex: 1 }}>
              <label>City</label>
              <input
                name="address.city"
                value={form.address?.city || ""}
                onChange={handleChange}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Country</label>
              <input
                name="address.country"
                value={form.address?.country || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label>Street Address</label>
            <input
              name="address.streetAddress"
              value={form.address?.streetAddress || ""}
              onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </main>
    </ProtectedRoute>
  );
}
