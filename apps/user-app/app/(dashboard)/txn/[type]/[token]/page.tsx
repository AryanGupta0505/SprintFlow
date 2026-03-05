
import { getTxn } from "../../../../lib/actions/getTxn";
import { SingleTransaction } from "../../../../../components/SingleTransaction";

export default async function TransactionPage({
  params,
}: {
  params: { type: string; token: string };
}) {
  const txn = await getTxn(params.token, params.type);

  if (!txn || "error" in txn) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500 py-20">
          Transaction Not Found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
      <SingleTransaction txn={txn} type={params.type} />
    </div>
  );
}