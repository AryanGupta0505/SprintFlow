
"use client";

import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";

export default function RequestsList({
  incoming,
  outgoing,
  refreshRequests,
  loading
}: any) {

  const router = useRouter();

  async function acceptRequest(req: any) {
    const res = await fetch("/api/payment-request/accept", {
      method: "POST",
      body: JSON.stringify({ requestId: req.id }),
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      alert("Failed to accept request");
      return;
    }
    window.dispatchEvent(new Event("payment-request-updated"));
    router.push(
      `/p2p?number=${req.fromUser.number}&amount=${req.amount}&requestId=${req.id}`
    );
  }

  async function rejectRequest(id: number) {
    const res = await fetch("/api/payment-request/reject", {
      method: "POST",
      body: JSON.stringify({ requestId: id }),
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      alert("Failed to reject request");
      return;
    }
    window.dispatchEvent(new Event("payment-request-updated"));
    refreshRequests();
  }

  if (loading) {
    return (
      <div className="text-center text-slate-500 py-6">
        Loading requests...
      </div>
    );
  }

  function statusBadge(status: string) {

    if (status === "Accepted") {
      return (
        <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
          Accepted
        </span>
      );
    }

    if (status === "Rejected") {
      return (
        <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700 font-medium">
          Rejected
        </span>
      );
    }

    return (
      <span className="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700 font-medium">
        Pending
      </span>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      {/* INCOMING */}
      <Card title="Incoming Requests">
        <div className="max-h-[320px] overflow-y-auto space-y-3 pr-2">

          {incoming.length === 0 && (
            <div className="text-sm text-slate-500 py-4">
              No incoming requests
            </div>
          )}

          {incoming.map((req: any) => (
            <div
              key={req.id}
              className="flex items-center justify-between border rounded-lg p-4 hover:shadow-sm transition"
            >

              <div>
                <div className="font-semibold text-slate-800">
                  {req.fromUser.name || req.fromUser.number}
                </div>

                <div className="text-lg font-bold text-[#0066FF] mt-1">
                  ₹{req.amount / 100}
                </div>
              </div>

              {req.status === "Pending" ? (
                <div className="flex gap-2">

                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 text-sm rounded-lg"
                    onClick={() => acceptRequest(req)}
                  >
                    Accept
                  </Button>

                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 text-sm rounded-lg"
                    onClick={() => rejectRequest(req.id)}
                  >
                    Reject
                  </Button>

                </div>
              ) : (
                statusBadge(req.status)
              )}

            </div>
          ))}

        </div>
      </Card>

      {/* OUTGOING */}
      <Card title="Outgoing Requests">
        <div className="max-h-[320px] overflow-y-auto space-y-3 pr-2">

          {outgoing.length === 0 && (
            <div className="text-sm text-slate-500 py-4">
              No outgoing requests
            </div>
          )}

          {outgoing.map((req: any) => (
            <div
              key={req.id}
              className="flex items-center justify-between border rounded-lg p-4 hover:shadow-sm transition"
            >

              <div>
                <div className="font-semibold text-slate-800">
                  {req.toUser.name || req.toUser.number}
                </div>

                <div className="text-lg font-bold text-[#0066FF] mt-1">
                  ₹{req.amount / 100}
                </div>
              </div>

              {statusBadge(req.status)}

            </div>
          ))}

        </div>
      </Card>

    </div>
  );
}