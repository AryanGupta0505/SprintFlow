
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

type Transaction = {
  id: string;
  amount: number;
  description: string;
  time: string | Date;
  status: "Success" | "Processing" | "Failure";
  source: "p2p" | "bank";
  direction: "sent" | "received";
  type: string;
  token: string;
};

export function AllTransactions({
  transactions,
  currentBalance
}: {
  transactions: Transaction[];
  currentBalance: number;
}) {
  const router = useRouter();

  const [sourceFilter, setSourceFilter] =
    useState<"all" | "p2p" | "bank">("all");

  const [directionFilter, setDirectionFilter] =
    useState<"all" | "sent" | "received">("all");

  const [statusFilter, setStatusFilter] =
    useState<"all" | "Success" | "Processing" | "Failed">("all");

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // NEW SEARCH STATE
  const [searchQuery, setSearchQuery] = useState("");

  // -------------------------
  // QUICK DATE HANDLERS
  // -------------------------
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const setToday = () => {
    const today = new Date();
    const local = formatLocalDate(today);
    setStartDate(local);
    setEndDate(local);
  };

  const setLast7Days = () => {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 6);

    setStartDate(formatLocalDate(past));
    setEndDate(formatLocalDate(today));
  };

  const setThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

    setStartDate(formatLocalDate(firstDay));
    setEndDate(formatLocalDate(now));
  };

  // -------------------------
  // FILTER LOGIC
  // -------------------------
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSource =
        sourceFilter === "all" || t.source === sourceFilter;

      const matchDirection =
        directionFilter === "all" || t.direction === directionFilter;

      const matchStatus =
        statusFilter === "all" || t.status === statusFilter;

      const txnDate = new Date(t.time);

      let matchDate = true;

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchDate = txnDate >= start;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchDate = matchDate && txnDate <= end;
      }

      // NEW SEARCH FILTER
      const matchSearch =
        searchQuery === "" ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.type.toLowerCase().includes(searchQuery.toLowerCase());

      return (
        matchSource &&
        matchDirection &&
        matchStatus &&
        matchDate &&
        matchSearch
      );
    });
  }, [
    transactions,
    sourceFilter,
    directionFilter,
    statusFilter,
    startDate,
    endDate,
    searchQuery
  ]);

  const clearFilters = () => {
    setSourceFilter("all");
    setDirectionFilter("all");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
  };

  const downloadStatement = async () => {

    const loadLogoAsBase64 = () =>
      new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = "/logo.svg";

        img.onload = () => {
          const scale = 4;

          const canvas = document.createElement("canvas");
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Canvas error");

          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);

          resolve(canvas.toDataURL("image/png"));
        };

        img.onerror = reject;
      });

    if (!filtered.length) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const allSuccess = [...transactions]
      .filter((t) => t.status === "Success")
      .sort(
        (a, b) =>
          new Date(a.time).getTime() -
          new Date(b.time).getTime()
      );

    let runningBalance = 0;
    const ledger: { txn: Transaction; balance: number }[] = [];

    allSuccess.forEach((t) => {
      if (t.direction === "received") {
        runningBalance += t.amount;
      } else {
        runningBalance -= t.amount;
      }

      ledger.push({
        txn: t,
        balance: runningBalance
      });
    });

    const filteredLedger = ledger.filter(({ txn }) => {
      const txnDate = new Date(txn.time);
      let match = true;

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        match = txnDate >= start;
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        match = match && txnDate <= end;
      }

      return match;
    });

    if (!filteredLedger.length) return;

    const firstEntry = filteredLedger[0];
    if(!firstEntry) return;
    const openingBalance =
      firstEntry.balance -
      (firstEntry.txn.direction === "received"
        ? firstEntry.txn.amount
        : -firstEntry.txn.amount);

    const lastEntry = filteredLedger[filteredLedger.length - 1];
    const finalBalance = lastEntry?.balance ?? 0;

    const totalCredit = filteredLedger
      .filter((l) => l.txn.direction === "received")
      .reduce((sum, l) => sum + l.txn.amount, 0);

    const totalDebit = filteredLedger
      .filter((l) => l.txn.direction === "sent")
      .reduce((sum, l) => sum + l.txn.amount, 0);

    const headerHeight = 48;
    const gradientSteps = 60;

    const startColor = { r: 0, g: 122, b: 255 };
    const endColor = { r: 0, g: 200, b: 180 };

    for (let i = 0; i < gradientSteps; i++) {
      const ratio = i / gradientSteps;

      const r = startColor.r + (endColor.r - startColor.r) * ratio;
      const g = startColor.g + (endColor.g - startColor.g) * ratio;
      const b = startColor.b + (endColor.b - startColor.b) * ratio;

      doc.setFillColor(r, g, b);
      doc.rect(
        0,
        (headerHeight / gradientSteps) * i,
        pageWidth,
        headerHeight / gradientSteps,
        "F"
      );
    }

    const logoBase64 = await loadLogoAsBase64();

    doc.addImage(logoBase64, "PNG", 14, 12, 24, 24);

    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("SPRINTFLOW", 45, 24);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Digital Wallet Statement", 45, 33);

    doc.setDrawColor(255);
    doc.setLineWidth(0.5);
    doc.line(14, 40, pageWidth - 14, 40);

    doc.setTextColor(0);

    doc.setFillColor(245, 247, 250);
    doc.roundedRect(14, 52, pageWidth - 28, 26, 5, 5, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Final Balance", 20, 67);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(
      `INR ${(finalBalance / 100).toFixed(2)}`,
      pageWidth - 20,
      67,
      { align: "right" }
    );

    const summaryY = 90;

    doc.setFontSize(11);

    doc.text(
      `Opening Balance: INR ${(openingBalance / 100).toFixed(2)}`,
      14,
      summaryY
    );

    doc.text(
      `Total Credit: INR ${(totalCredit / 100).toFixed(2)}`,
      14,
      summaryY + 8
    );

    doc.text(
      `Total Debit: INR ${(totalDebit / 100).toFixed(2)}`,
      14,
      summaryY + 16
    );

    doc.text(
      `Date Range: ${startDate || "Beginning"} - ${endDate || "Now"}`,
      pageWidth - 14,
      summaryY,
      { align: "right" }
    );

    doc.text(
      `Generated On: ${new Date().toLocaleString()}`,
      pageWidth - 14,
      summaryY + 8,
      { align: "right" }
    );

    let yPosition = 120;

    filteredLedger
      .slice()
      .reverse()
      .forEach(({ txn, balance }) => {

        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }

        const dateObj = new Date(txn.time);
        const isCredit = txn.direction === "received";
        const formattedAmount = `${isCredit ? "+" : "-"} INR ${(txn.amount / 100).toFixed(2)}`;

        doc.setDrawColor(235);
        doc.line(14, yPosition - 6, pageWidth - 14, yPosition - 6);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(dateObj.toLocaleDateString(), 14, yPosition);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(dateObj.toLocaleTimeString(), 14, yPosition + 6);

        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text(txn.description, 45, yPosition);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Transaction ID: ${txn.token}`, 45, yPosition + 6);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);

        if (isCredit) {
          doc.setTextColor(22, 163, 74);
        } else {
          doc.setTextColor(220, 38, 38);
        }

        doc.text(
          formattedAmount,
          pageWidth - 14,
          yPosition,
          { align: "right" }
        );

        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(
          `Balance: INR ${(balance / 100).toFixed(2)}`,
          pageWidth - 14,
          yPosition + 8,
          { align: "right" }
        );

        doc.setTextColor(0);
        yPosition += 26;
      });

    doc.setFontSize(9);
    doc.setTextColor(150);

    doc.text(
      "This is a system generated statement.",
      14,
      pageHeight - 10
    );

    doc.text(
      `Page ${doc.getNumberOfPages()}`,
      pageWidth - 20,
      pageHeight - 10
    );

    doc.save(
      `statement_${startDate || "all"}_${endDate || "all"}.pdf`
    );
  };

  return (
    <Card title="All Transactions">
      <div className="p-4">

        {/* FILTER BAR */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">

          {/* SEARCH BAR */}
          <div className="relative w-[320px]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>

            <input
              type="text"
              placeholder="Search phone number, bank name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full
                pl-9 pr-4 py-2.5
                text-sm
                bg-white
                border border-slate-200
                rounded-xl
                shadow-sm
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-200
                placeholder:text-gray-400
              "
            />
          </div>

          <Select
            value={sourceFilter}
            onSelect={(v) => setSourceFilter(v as any)}
            options={[
              { key: "All Sources", value: "all" },
              { key: "P2P", value: "p2p" },
              { key: "Bank", value: "bank" },
            ]}
          />

          <Select
            value={directionFilter}
            onSelect={(v) => setDirectionFilter(v as any)}
            options={[
              { key: "All Types", value: "all" },
              { key: "Sent", value: "sent" },
              { key: "Received", value: "received" },
            ]}
          />

          <Select
            value={statusFilter}
            onSelect={(v) => setStatusFilter(v as any)}
            options={[
              { key: "All Status", value: "all" },
              { key: "Success", value: "Success" },
              { key: "Processing", value: "Processing" },
              { key: "Failed", value: "Failed" },
            ]}
          />

          <button
            onClick={downloadStatement}
            disabled={!filtered.length}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              filtered.length
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:scale-95"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Download size={16} />
            Download Statement
          </button>
        </div>

        {/* TRANSACTION LIST */}

        {!filtered.length ? (
          <div className="text-center py-10 text-slate-500">
            No Transactions Found
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {filtered.map((t) => {
              const isReceived = t.direction === "received";

              return (
                <div
                  key={t.id}
                  onClick={() => router.push(`/txn/${t.type}/${t.token}`)}
                  className="flex justify-between items-center border rounded-xl p-4 hover:shadow-md transition cursor-pointer bg-white"
                >
                  <div>
                    <div
                      className={`font-semibold flex items-center gap-2 ${
                        isReceived
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {isReceived ? "↘" : "↗"} ₹ {t.amount / 100}
                    </div>

                    <div className="text-sm text-gray-600">
                      {t.description}
                    </div>

                    <div className="text-xs text-gray-400">
                      {new Date(t.time).toLocaleString()}
                    </div>
                  </div>

                  <div
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      t.status === "Success"
                        ? "bg-green-100 text-green-600"
                        : t.status === "Processing"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {t.status}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}