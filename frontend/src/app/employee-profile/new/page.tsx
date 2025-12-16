'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ChangeEvent, FormEvent } from 'react';
import { api } from '@/lib/axios';
import {
  ContractType,
  CreateEmployeeProfileDto,
  EmployeeProfile,
  EmployeeStatus,
  Gender,
  MaritalStatus,
} from '@/types/employeeProfile';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

const contractTypes: ContractType[] = [
  "FULL_TIME_CONTRACT",
  "PART_TIME_CONTRACT",
];

const genders: Gender[] = ["MALE", "FEMALE"];

const maritalStatuses: MaritalStatus[] = [
  "SINGLE",
  "MARRIED",
  "DIVORCED",
  "WIDOWED",
];

const statuses: EmployeeStatus[] = [
  "ACTIVE",
  "INACTIVE",
  "ON_LEAVE",
  "SUSPENDED",
  "RETIRED",
  "PROBATION",
  "TERMINATED",
];

export default function CreateEmployeePage() {
  const [form, setForm] = useState<CreateEmployeeProfileDto>({
    employeeNumber: "",
    firstName: "",
    lastName: "",
    nationalId: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    dateOfHire: "",
    contractType: "FULL_TIME_CONTRACT",
    positionTitle: undefined,
    departmentName: undefined,
    departmentCode: undefined,
    payGradeId: undefined,
    gender: "MALE",
    maritalStatus: "SINGLE",
    status: "ACTIVE",
  });

  const [result, setResult] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔔 toast message
  const [toast, setToast] = useState<string | null>(null);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    // For optional fields (positionTitle, departmentName, departmentCode, payGradeId), 
    // set to undefined if empty, otherwise use the value
    const optionalFields = ['positionTitle', 'departmentName', 'departmentCode', 'payGradeId'];
    if (optionalFields.includes(name)) {
      setForm((prev) => ({
        ...prev,
        [name]: value.trim() === "" ? undefined : value,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Build payload, removing empty strings and converting to proper format
      const payload: CreateEmployeeProfileDto = {
        employeeNumber: form.employeeNumber.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        nationalId: form.nationalId.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        dateOfBirth: new Date(form.dateOfBirth).toISOString(),
        dateOfHire: new Date(form.dateOfHire).toISOString(),
        contractType: form.contractType,
        status: form.status,
        gender: form.gender,
        maritalStatus: form.maritalStatus,
      };

      // Add optional fields only if they have values
      if (form.positionTitle?.trim()) {
        payload.positionTitle = form.positionTitle.trim();
      }
      if (form.departmentName?.trim()) {
        payload.departmentName = form.departmentName.trim();
      }
      if (form.departmentCode?.trim()) {
        payload.departmentCode = form.departmentCode.trim();
      }
      if (form.payGradeId?.trim() && form.payGradeId.trim() !== 'optional') {
        payload.payGradeId = form.payGradeId.trim();
      }

      const res = await api.post<EmployeeProfile>(
        "/employee-profile",
        payload
      );
      setResult(res.data);
      setToast("Employee created successfully. Redirecting...");
      
      // Redirect to employee details page after 1.5 seconds
      setTimeout(() => {
        const employeeId = res.data._id || (res.data as any).id;
        if (employeeId) {
          router.push(`/employee-profile/${employeeId}`);
        } else {
          router.push('/employee-profile');
        }
      }, 1500);
    } catch (err: any) {
      console.error('Error creating employee:', err);
      
      // Handle validation errors from class-validator
      if (err?.response?.status === 400 && err?.response?.data?.message) {
        const validationErrors = err.response.data.message;
        if (Array.isArray(validationErrors)) {
          // Format validation errors nicely
          const errorMessages = validationErrors.map((error: any) => {
            if (typeof error === 'string') return error;
            return Object.values(error.constraints || {}).join(', ');
          }).join('\n');
          setError(errorMessages);
        } else {
          setError(validationErrors);
        }
      } else {
        // Handle other errors (403, 500, etc.)
        const backendMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          (err?.response?.status === 403 
            ? 'You do not have permission to create employees. Please contact your administrator.'
            : err?.response?.status === 500
            ? 'Server error occurred. Please try again later.'
            : err?.message ||
            "Failed to create employee");
        setError(
          typeof backendMessage === "string"
            ? backendMessage
            : JSON.stringify(backendMessage)
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Employee Profile</h1>
          <p className="text-gray-600 mt-1">
            Use this form to onboard a new employee into the system. Required fields cover personal info, employment details and basic classification.
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Back
        </Button>
      </div>

      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      {toast && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <span className="text-green-600">✅</span>
          <p className="text-sm text-green-800">{toast}</p>
        </div>
      )}

      <Card title="Create Employee">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee number */}
            <div>
              <label htmlFor="employeeNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Employee Number *
              </label>
              <input
                id="employeeNumber"
                name="employeeNumber"
                placeholder="EMP-0010"
                value={form.employeeNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* First / Last name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* National ID */}
            <div>
              <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 mb-1">
                National ID *
              </label>
              <input
                id="nationalId"
                name="nationalId"
                value={form.nationalId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Email / phone */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Personal Email *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="hatem@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Phone *
              </label>
              <input
                id="phone"
                name="phone"
                placeholder="+20..."
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Dates */}
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                id="dateOfBirth"
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="dateOfHire" className="block text-sm font-medium text-gray-700 mb-1">
                Date of Hire *
              </label>
              <input
                id="dateOfHire"
                type="date"
                name="dateOfHire"
                value={form.dateOfHire}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Contract / status */}
            <div>
              <label htmlFor="contractType" className="block text-sm font-medium text-gray-700 mb-1">
                Contract Type *
              </label>
              <select
                id="contractType"
                name="contractType"
                value={form.contractType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {contractTypes.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Employment Status *
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender / marital status */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {genders.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Marital Status
              </label>
              <select
                id="maritalStatus"
                name="maritalStatus"
                value={form.maritalStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {maritalStatuses.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Position / department */}
            <div>
              <label htmlFor="positionTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Position Title (optional)
              </label>
              <input
                id="positionTitle"
                name="positionTitle"
                placeholder="Software Developer"
                value={form.positionTitle || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="departmentName" className="block text-sm font-medium text-gray-700 mb-1">
                Department Name (optional)
              </label>
              <input
                id="departmentName"
                name="departmentName"
                placeholder="IT"
                value={form.departmentName || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Department code / pay grade */}
            <div>
              <label htmlFor="departmentCode" className="block text-sm font-medium text-gray-700 mb-1">
                Department Code
              </label>
              <input
                id="departmentCode"
                name="departmentCode"
                placeholder="DEPT-IT"
                value={form.departmentCode || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="payGradeId" className="block text-sm font-medium text-gray-700 mb-1">
                Pay Grade ID (Mongo ObjectId, optional)
              </label>
              <input
                id="payGradeId"
                name="payGradeId"
                placeholder="optional"
                value={form.payGradeId || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Employee"}
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

    </div>
  );
}