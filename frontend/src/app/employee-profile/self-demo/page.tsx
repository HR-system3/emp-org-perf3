'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';
import {
  EmployeeProfile,
  SelfServiceUpdateProfileDto,
  Address,
} from '@/types/employeeProfile';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import Loading from '@/components/common/Loading';

export default function SelfServiceProfileDemoPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
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
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1] as keyof Address;
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
      setMessage('Profile updated successfully.');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Self-Service Profile</h1>
          <p className="text-gray-600 mt-1">
            Employee self-service screen for viewing and editing their own profile.
            Paste an existing employee profile Mongo _id to load the profile.
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Back
        </Button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">{message}</p>
        </div>
      )}

      <Card>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="EmployeeProfile Mongo _id"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button onClick={loadProfile} disabled={loading}>
            {loading ? 'Loading...' : 'Load Profile'}
          </Button>
        </div>
      </Card>

      {loading && <Loading text="Loading profile..." />}

      {profile && (
        <Card title="Editable Fields">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Email
              </label>
              <input
                type="email"
                name="personalEmail"
                value={form.personalEmail || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Phone
                </label>
                <input
                  type="tel"
                  name="mobilePhone"
                  value={form.mobilePhone || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Home Phone
                </label>
                <input
                  type="tel"
                  name="homePhone"
                  value={form.homePhone || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biography
              </label>
              <textarea
                name="biography"
                rows={3}
                value={form.biography || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="address.city"
                    value={form.address?.city || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="address.country"
                    value={form.address?.country || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address.streetAddress"
                  value={form.address?.streetAddress || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
