// src/app/employee-profile/new/page.tsx

"use client";

import { useState, useEffect } from "react";
import type { ChangeEvent, FormEvent } from "react";
import api from "@/lib/axios";
import {
  ContractType,
  CreateEmployeeProfileDto,
  EmployeeProfile,
  EmployeeStatus,
  Gender,
  MaritalStatus,
} from "@/types/employeeProfile";
import BackButton from "@/components/BackButton";

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
    positionTitle: "",
    departmentName: "",
    departmentCode: "",
    payGradeId: "",
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
    setForm((prev) => ({
      ...prev,
      [name]: value === "" ? undefined : value,
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        ...form,
        employeeNumber: form.employeeNumber.trim(),
        payGradeId: form.payGradeId ? form.payGradeId.trim() : undefined,
        dateOfBirth: new Date(form.dateOfBirth).toISOString(),
        dateOfHire: new Date(form.dateOfHire).toISOString(),
      };

      const res = await api.post<EmployeeProfile>(
        "/employee-profile",
        payload
      );
      setResult(res.data);
      setToast("Employee created successfully.");
    } catch (err: any) {
      console.error(err);
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Failed to create employee";
      setError(
        typeof backendMessage === "string"
          ? backendMessage
          : JSON.stringify(backendMessage)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="card">
        <BackButton />
        <header style={{ marginBottom: "1.25rem" }}>
          <h1>Create Employee Profile (HR)</h1>
          <p className="text-muted">
            Use this form to onboard a new employee into the system. Required
            fields cover personal info, employment details and basic
            classification (contract, status, department).
          </p>
        </header>

        {error && <p className="error">Error: {error}</p>}
        {result && !error && (
          <p className="success">
            Employee created successfully. You can copy the Mongo{" "}
            <code>_id</code> and employee number from the JSON below.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Employee number */}
            <div className="form-row">
              <label htmlFor="employeeNumber">Employee Number *</label>
              <input
                id="employeeNumber"
                name="employeeNumber"
                placeholder="EMP-0010"
                value={form.employeeNumber}
                onChange={handleChange}
                required
              />
            </div>

            {/* First / Last name */}
            <div className="form-row">
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>

            {/* National ID */}
            <div className="form-row">
              <label htmlFor="nationalId">National ID *</label>
              <input
                id="nationalId"
                name="nationalId"
                value={form.nationalId}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email / phone */}
            <div className="form-row">
              <label htmlFor="email">Personal Email *</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="hatem@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="phone">Mobile Phone *</label>
              <input
                id="phone"
                name="phone"
                placeholder="+20..."
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* Dates */}
            <div className="form-row">
              <label htmlFor="dateOfBirth">Date of Birth *</label>
              <input
                id="dateOfBirth"
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="dateOfHire">Date of Hire *</label>
              <input
                id="dateOfHire"
                type="date"
                name="dateOfHire"
                value={form.dateOfHire}
                onChange={handleChange}
                required
              />
            </div>

            {/* Contract / status */}
            <div className="form-row">
              <label htmlFor="contractType">Contract Type *</label>
              <select
                id="contractType"
                name="contractType"
                value={form.contractType}
                onChange={handleChange}
              >
                {contractTypes.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label htmlFor="status">Employment Status *</label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender / marital status */}
            <div className="form-row">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                {genders.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <label htmlFor="maritalStatus">Marital Status</label>
              <select
                id="maritalStatus"
                name="maritalStatus"
                value={form.maritalStatus}
                onChange={handleChange}
              >
                {maritalStatuses.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Position / department */}
            <div className="form-row">
              <label htmlFor="positionTitle">Position Title</label>
              <input
                id="positionTitle"
                name="positionTitle"
                placeholder="Software Developer"
                value={form.positionTitle}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label htmlFor="departmentName">Department Name</label>
              <input
                id="departmentName"
                name="departmentName"
                placeholder="IT"
                value={form.departmentName}
                onChange={handleChange}
              />
            </div>

            {/* Department code / pay grade */}
            <div className="form-row">
              <label htmlFor="departmentCode">Department Code</label>
              <input
                id="departmentCode"
                name="departmentCode"
                placeholder="DEPT-IT"
                value={form.departmentCode || ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <label htmlFor="payGradeId">
                Pay Grade ID (Mongo ObjectId, optional)
              </label>
              <input
                id="payGradeId"
                name="payGradeId"
                placeholder="optional"
                value={form.payGradeId || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: "1.25rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>

        {result && (
          <div className="result-block">
            <h2 style={{ marginBottom: "0.6rem" }}>Created Employee</h2>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast">
          <span>✅</span>
          <span>{toast}</span>
        </div>
      )}
    </main>
  );
}