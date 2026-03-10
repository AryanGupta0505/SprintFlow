
"use client";

import { useEffect, useState, useRef } from "react";
import { Users } from "../../../components/UsersCard";
import RequestForm from "./RequestForm";
import RequestsList from "./RequestsList";

export default function PaymentRequestsClient({ users }: any) {

  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [number, setNumber] = useState("");

  const requestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const res = await fetch("/api/payment-request/get");
      const data = await res.json();

      setIncoming(data.incoming || []);
      setOutgoing(data.outgoing || []);
    } catch (err) {
      console.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {

    function handleRequestCreated() {
      loadRequests();
    }

    function handleRequestUpdated() {
      loadRequests();
    }

    window.addEventListener("payment-request-created", handleRequestCreated);
    window.addEventListener("payment-request-updated", handleRequestUpdated);

    return () => {
      window.removeEventListener("payment-request-created", handleRequestCreated);
      window.removeEventListener("payment-request-updated", handleRequestUpdated);
    };

  }, []);

  function handleSelectUser(num: string) {
    setNumber(num);
    requestRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10">

      <div className="mb-10">
        <h1 className="text-4xl font-bold text-[#6a51a6] tracking-tight">
          Payment Requests
        </h1>
        <p className="text-slate-500 mt-2 text-lg">
          Request money from your friends
        </p>
      </div>

      {/* REQUEST FORM + USERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">

        <div
          ref={requestRef}
          className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6 "
        >
          <RequestForm
            number={number}
            setNumber={setNumber}
            refreshRequests={loadRequests}
          />
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <Users users={users} onSelectUser={handleSelectUser} />
        </div>

      </div>

      {/* REQUEST LISTS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <RequestsList
          incoming={incoming}
          outgoing={outgoing}
          loading={loading}
          refreshRequests={loadRequests}
        />
      </div>

    </div>
  );
}