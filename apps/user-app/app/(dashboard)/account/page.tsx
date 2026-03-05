
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@repo/ui/card";
import { useRouter } from "next/navigation";
import { SprintFlowLoader } from "../../../components/SprintFlowLoader";
export default function AccountSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fetchUser = async () => {
    const res = await axios.get("/api/account/me");
    setUser(res.data.user);
    setName(res.data.user.name || "");
    setEmail("");
    setNumber("");
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (!user) return <SprintFlowLoader/>;

  /* ---------------- PROFILE UPDATE ---------------- */

  const handleProfileUpdate = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("/api/account/update-profile", {
        name,
        email,
        number
      });

      if (res.data.success) {
        setMessage(res.data.message);
        setEmail("");
        setNumber("");
        await fetchUser();
      } else {
        setMessage(res.data.message);
      }

    } catch {
      setMessage("Something went wrong");
    }

    setLoading(false);
  };

  /* ---------------- PASSWORD UPDATE ---------------- */

  const handlePasswordChange = async () => {
    setPasswordMessage("");

    if (newPassword !== confirmPassword) {
      return setPasswordMessage("New passwords do not match");
    }

    setPasswordLoading(true);

    try {
      const res = await axios.post("/api/account/change-password", {
        oldPassword,
        newPassword
      });

      setPasswordMessage(res.data.message);

      if (res.data.success) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }

    } catch {
      setPasswordMessage("Something went wrong");
    }

    setPasswordLoading(false);
  };

  /* ---------------- DELETE ACCOUNT ---------------- */

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteMessage("");

    try {
      const res = await axios.post("/api/account/delete", {
        password: deletePassword
      });

      setDeleteMessage(res.data.message);

      if (res.data.success) {
        setTimeout(() => {
          router.push("/signin");
        }, 1500);
      }

    } catch {
      setDeleteMessage("Something went wrong");
    }

    setDeleteLoading(false);
  };

  const StatusRow = ({
    label,
    active
  }: {
    label: string;
    active: boolean;
  }) => (
    <div className="flex justify-between items-center">
      <span className="text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={`w-3 h-3 rounded-full ${
            active ? "bg-green-500" : "bg-yellow-400"
          }`}
        />
        <span
          className={`text-sm font-medium ${
            active ? "text-green-600" : "text-yellow-600"
          }`}
        >
          {active ? "Active" : "Not Set"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">

      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-[#6a51a6] tracking-tight">
          Account Settings
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Manage your profile and security preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* LEFT SIDE (UNCHANGED) */}
        <div className="lg:col-span-7 flex flex-col gap-8">

          {/* PROFILE CARD — ORIGINAL */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <Card title="Profile Information">
              <div className="space-y-6">

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-teal-400 outline-none"
                />

                {user.email ? (
                  <div className="bg-slate-100 p-3 rounded-lg flex justify-between">
                    {user.email}
                    <span className="text-xs text-slate-400">Locked</span>
                  </div>
                ) : (
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Set Email"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3"
                  />
                )}

                {user.number ? (
                  <div className="bg-slate-100 p-3 rounded-lg flex justify-between">
                    {user.number}
                    <span className="text-xs text-slate-400">Locked</span>
                  </div>
                ) : (
                  <input
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Set Phone Number"
                    className="w-full border border-slate-300 rounded-lg px-4 py-3"
                  />
                )}

                <button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-400"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>

                {message && (
                  <div className="text-green-600 text-sm text-center">
                    {message}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* CHANGE PASSWORD — ORIGINAL */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <Card title="Change Password">
              <div className="space-y-5">

                <input
                  type="password"
                  placeholder="Old Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3"
                />

                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3"
                />

                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-3"
                />

                <button
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-400"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>

                {passwordMessage && (
                  <div className="text-sm text-center text-slate-600">
                    {passwordMessage}
                  </div>
                )}
              </div>
            </Card>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-5 space-y-8">

          {/* SECURITY OVERVIEW — ORIGINAL */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <Card title="Security Overview">
              <div className="space-y-6">
                <StatusRow label="UPI PIN" active={!!user.upiPin} />
                <StatusRow label="Email Verified" active={!!user.email} />
                <StatusRow label="Phone Verified" active={!!user.number} />
                <StatusRow label="Password" active={true} />
              </div>
            </Card>
          </div>

          {/* NEW DANGER ZONE */}
          <div className="bg-red-50 rounded-2xl shadow-sm border border-red-200 p-6 relative overflow-hidden">

            {/* Accent Bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-2xl" />

            <Card title="Danger Zone">
              <div className="space-y-5">

                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-600">
                    Permanent Action
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Deleting your account will permanently remove access to your wallet,
                    transactions, and profile data. This action cannot be undone.
                  </p>
                </div>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Delete Account Permanently
                </button>

              </div>
            </Card>
          </div>

        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white p-8 rounded-3xl w-[420px] space-y-6 shadow-2xl border border-red-100">

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-red-600">
                Confirm Account Deletion
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                This action is irreversible. Please enter your password to confirm
                permanent deletion of your account.
              </p>
            </div>

            <input
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full border border-slate-300 focus:border-red-400 focus:ring-2 focus:ring-red-200 rounded-xl px-4 py-3 outline-none transition-all"
            />

            <div className="flex flex-col gap-3">

              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {deleteLoading ? "Deleting Account..." : "Confirm Delete"}
              </button>

              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>

            </div>

            {deleteMessage && (
              <div className="text-sm text-center text-red-600 font-medium">
                {deleteMessage}
              </div>
            )}

    </div>
  </div>
)}

    </div>
  );
}