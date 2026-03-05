
"use client";

import { Card } from "@repo/ui/card";
import { CheckCircle, XCircle, Loader, Download } from "lucide-react";
import { jsPDF } from "jspdf";

export function SingleTransaction({
  txn,
  type,
}: {
  txn: any;
  type: string;
}) {
  const txnTime = txn.timestamp || txn.startTime || txn.time;

  const formattedDate = txnTime
    ? new Date(txnTime).toLocaleString()
    : "N/A";

  const isSuccess = txn.status === "Success";
  const isProcessing = txn.status === "Processing";
  const isFailed = txn.status === "Failed";

const generateReceipt = async () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const txnTime = txn.timestamp || txn.startTime || txn.time;
  const formattedDate = txnTime
    ? new Date(txnTime).toLocaleString()
    : "N/A";

  const amount = `INR ${txn.amount / 100}`;

  // 🔹 Status Color
  let statusColor: [number, number, number] = [16, 185, 129];
  if (txn.status === "Processing") statusColor = [234, 179, 8];
  if (txn.status === "Failed") statusColor = [239, 68, 68];

  // ================= HEADER (Gradient + Logo) =================

  const headerHeight = 45;
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

  const logoBase64 = await loadLogoAsBase64();

  doc.addImage(logoBase64, "PNG", 14, 10, 22, 22);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Transaction Receipt", 45, 22);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("SprintFlow Wallet", 45, 32);

  doc.setDrawColor(255);
  doc.setLineWidth(0.5);
  doc.line(14, 38, pageWidth - 14, 38);

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // 🔹 Card Container
  doc.setDrawColor(220);
  doc.roundedRect(15, 55, pageWidth - 30, 120, 5, 5);

  // 🔹 Big Amount
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(amount, pageWidth / 2, 80, { align: "center" });

  // 🔹 Status Text
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...statusColor);
  doc.text(txn.status, pageWidth / 2, 90, { align: "center" });

  doc.setTextColor(0, 0, 0);

  // 🔹 Divider Line
  doc.setDrawColor(230);
  doc.line(25, 100, pageWidth - 25, 100);

  // 🔹 Details Section
  doc.setFontSize(12);

  const startY = 115;
  const gap = 12;

  const details = [
    ["Transaction ID", txn.token],
    ["Type", type.toUpperCase()],
    ["Date", formattedDate],
    ["Description", txn.description],
  ];

  details.forEach((item, index) => {
    const y = startY + index * gap;

    doc.setFont("helvetica", "normal");
    doc.text(item[0], 30, y);

    doc.setFont("helvetica", "bold");
    doc.text(String(item[1]), pageWidth - 30, y, {
      align: "right",
    });
  });

  // 🔹 Footer
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(
    "This is a system generated receipt.",
    pageWidth / 2,
    190,
    { align: "center" }
  );

  doc.save(`receipt-${txn.token}.pdf`);
};
  return (
    <Card title="Transaction Details">
      <div className="p-4">

        {/* 🔹 Top Section */}
        <div className="flex flex-col items-center justify-center py-8">

          {isSuccess && (
            <CheckCircle
              size={52}
              className="text-green-500 mb-4 animate-scaleIn"
            />
          )}

          {isProcessing && (
            <Loader
              size={52}
              className="text-yellow-500 mb-4 animate-spin"
            />
          )}

          {isFailed && (
            <XCircle
              size={52}
              className="text-red-500 mb-4 animate-pulse"
            />
          )}

          <div
            className={`text-4xl font-bold transition-all duration-500 ${
              isSuccess
                ? "text-green-600"
                : isProcessing
                ? "text-yellow-600"
                : "text-red-600"
            } animate-fadeIn`}
          >
            ₹ {txn.amount / 100}
          </div>

          <div
            className={`mt-3 px-4 py-1 text-sm font-medium rounded-full ${
              isSuccess
                ? "bg-green-100 text-green-600"
                : isProcessing
                ? "bg-yellow-100 text-yellow-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {txn.status}
          </div>

          {/* 🔽 Download Button */}
          <button
            onClick={generateReceipt}
            className="mt-6 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-md active:scale-95"
          >
            <Download size={16} />
            Download Receipt
          </button>
        </div>

        {/* Divider */}
        <div className="border-t mb-6"></div>

        {/* 🔹 Details Section */}
        <div className="space-y-4 text-sm">

          <Detail label="Transaction ID" value={txn.token} />
          <Detail label="Type" value={type.toUpperCase()} />
          <Detail label="Date" value={formattedDate} />
          <Detail label="Amount" value={`₹ ${txn.amount / 100}`} />
          <Detail label="Description" value={txn.description} />

        </div>

      </div>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center">
      <div className="text-gray-500">{label}</div>
      <div className="font-medium text-gray-800 text-right max-w-[60%] break-words">
        {value}
      </div>
    </div>
  );
}