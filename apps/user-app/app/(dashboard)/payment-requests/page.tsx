import PaymentRequestsClient from "./PaymentRequestsClient";
import { getUsers } from "../../lib/actions/users";

export default async function Page() {
  const users = await getUsers();

  return <PaymentRequestsClient users={users} />;
}