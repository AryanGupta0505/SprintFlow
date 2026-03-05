
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";
import jsQR from "jsqr";
import {
  Download,
  Share2,
  Camera,
  Upload
} from "lucide-react";
import { MyQRSkeleton } from "../../../components/MyQRSkeleton";

export default function QRPage() {
  const [qr, setQr] = useState("");
  const [userNumber, setUserNumber] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState("");
  const [uploadedNumber, setUploadedNumber] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/qr/generate")
      .then((res) => res.json())
      .then((data) => {
        setQr(data.qr);
        setUserNumber(data.number);
      })
      .catch(() => setError("Failed to load QR"));
  }, []);

  /* ---------------- ORIGINAL LOGIC (UNCHANGED) ---------------- */

  const parseQR = (text: string) => {
    try {
      const parsed = JSON.parse(text);
      if (parsed.type === "P2P" && parsed.number) {
        return parsed.number;
      }
    } catch {
      return null;
    }
    return null;
  };

  const handleCameraScan = (text: string) => {
    const number = parseQR(text);
    if (number) router.push(`/p2p?number=${number}`);
    else setError("Invalid QR Code");
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError("");
    setUploadedNumber(null);

    const file = e.target.files?.[0];
    if (!file) return;

    const img = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;
    ctx?.drawImage(img, 0, 0);

    const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
    if (!imageData) return;

    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      const number = parseQR(code.data);
      if (number) setUploadedNumber(number);
      else setError("Invalid QR format");
    } else setError("QR not detected");
  };

  const generateStyledQRImage = async () => {
  if (!qr) return null;

  const qrImg = new Image();
  qrImg.crossOrigin = "anonymous";
  qrImg.src = qr;

  await new Promise((res) => (qrImg.onload = res));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const width = 750;
  const height = 950;

  canvas.width = width;
  canvas.height = height;

  const centerX = width / 2;

  /* ---------------- Background ---------------- */

  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(0, 0, width, height);

  /* ---------------- Rounded Teal Border ---------------- */

  const outerRadius = 40;

  ctx.fillStyle = "#14b8a6";
  ctx.beginPath();
  ctx.roundRect(60, 60, width - 120, height - 120, outerRadius);
  ctx.fill();

  /* ---------------- Inner White Card ---------------- */

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(78, 78, width - 156, height - 156, outerRadius - 10);
  ctx.fill();

  /* ---------------- SprintFlow Title ---------------- */

  const titleGradient = ctx.createLinearGradient(
    centerX - 250,
    0,
    centerX + 250,
    0
  );

  titleGradient.addColorStop(0, "#2563eb"); // Electric Blue
  titleGradient.addColorStop(1, "#14b8a6"); // Teal

  ctx.fillStyle = titleGradient;
  ctx.textAlign = "center";
  ctx.font = "bold 64px sans-serif";
  ctx.fillText("SprintFlow", centerX, 230);

  /* ---------------- Subtitle ---------------- */

  ctx.fillStyle = "#64748b";
  ctx.font = "22px sans-serif";
  ctx.fillText("Scan to Pay Instantly", centerX, 280);

  /* ---------------- QR ---------------- */

  const qrSize = 420;
  ctx.drawImage(
    qrImg,
    centerX - qrSize / 2,
    340,
    qrSize,
    qrSize
  );

  /* ---------------- Phone Number (MOVED UP) ---------------- */

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 32px sans-serif";
  ctx.fillText(userNumber, centerX, 780); // moved up from 830

  ctx.fillStyle = "#94a3b8";
  ctx.font = "20px sans-serif";
  ctx.fillText(
    "Secure • Instant • Smart Payments",
    centerX,
    820 // moved up from 875
  );

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
};

  const downloadQR = async () => {
    const blob = await generateStyledQRImage();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sprintflow-qr.png";
    link.click();
    URL.revokeObjectURL(url);
  };

  const shareQR = async () => {
    const blob = await generateStyledQRImage();
    if (!blob) return;

    const file = new File([blob], "sprintflow-qr.png", {
      type: "image/png",
    });

    const paymentLink = `${window.location.origin}/p2p?number=${userNumber}`;
    const message = `Pay me on SprintFlow:\n${paymentLink}`;

    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "SprintFlow Payment QR",
          text: message,
          files: [file],
        });
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: "SprintFlow Payment",
          text: message,
        });
        return;
      }

      await navigator.clipboard.writeText(paymentLink);
      alert("Payment link copied!");
    } catch {
      downloadQR();
    }
  };

  /* ---------------- ORIGINAL UI FULLY PRESERVED ---------------- */

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">

      <div className="mb-12">
        <h1 className="text-4xl font-bold text-[#6a51a6] tracking-tight">
          QR Payments
        </h1>
        <p className="text-slate-500 mt-2">
          Secure • Instant • Contactless Transfers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* My QR */}
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-800 mb-8">
            My QR Code
          </h2>

          {qr ? (
            <div className="flex flex-col items-center gap-8">
              <div className="p-6 bg-slate-50 rounded-3xl shadow-inner border border-slate-200">
                <img src={qr} alt="QR" className="w-64 h-64 rounded-xl" />
              </div>

              <div className="flex gap-4 w-full">
                <button
                  onClick={downloadQR}
                  className="flex-1 flex items-center justify-center gap-3 bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition"
                >
                  <Download size={20} />
                  Download
                </button>

                <button
                  onClick={shareQR}
                  className="flex-1 flex items-center justify-center gap-3 bg-teal-500 text-white py-3 rounded-xl font-medium hover:bg-teal-600 transition"
                >
                  <Share2 size={20} />
                  Share QR
                </button>
              </div>
            </div>
          ) : (
            // <p className="text-slate-500">Generating QR...</p>
            <MyQRSkeleton/>
          )}
        </div>

        {/* Scan & Pay */}
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-800 mb-8">
            Scan & Pay
          </h2>

          {!cameraOpen && (
            <button
              onClick={() => setCameraOpen(true)}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              <Camera size={22} />
              Open Camera
            </button>
          )}

        {cameraOpen && (
  <div className="relative mt-6 rounded-2xl overflow-hidden border border-slate-200">

    <Scanner
      constraints={{ facingMode: "environment" }}
      scanDelay={300}
      onScan={(result) => {
        if (result?.[0]?.rawValue) {
          handleCameraScan(result[0].rawValue);
        }
      }}
      onError={() => setError("Camera error")}
      components={{ finder: false}}
    />

    {/* Custom Electric Blue Overlay */}
<div className="absolute inset-0 pointer-events-none">

  {/* Top Left */}
  <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-[#2563eb] rounded-tl-2xl" />

  {/* Top Right */}
  <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-[#2563eb] rounded-tr-2xl" />

  {/* Bottom Left */}
  <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-[#2563eb] rounded-bl-2xl" />

  {/* Bottom Right */}
  <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-[#2563eb] rounded-br-2xl" />

</div>

  </div>
)}

          <div className="mt-10">
            <p className="text-sm text-slate-500 mb-3">
              Or upload QR image
            </p>

            <label className="flex items-center justify-center gap-3 w-full border-2 border-dashed border-slate-300 rounded-xl py-6 cursor-pointer hover:border-blue-500 transition text-slate-600">
              <Upload size={22} />
              <span>Click to upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          </div>

          {uploadedNumber && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-2xl">
              <p className="text-green-700 font-semibold">
                QR detected successfully
              </p>

              <p className="mt-2 text-sm text-slate-700">
                Recipient: <span className="font-medium">{uploadedNumber}</span>
              </p>

              <button
                onClick={() =>
                  router.push(`/p2p?number=${uploadedNumber}`)
                }
                className="mt-5 w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition"
              >
                Continue to Pay
              </button>
            </div>
          )}

          {error && (
            <p className="mt-6 text-red-500 text-sm">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}