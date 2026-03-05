"use client";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
// import { getUsers } from "../app/lib/actions/users";

export  function Users({users, onSelectUser}:{users: any[], onSelectUser: (number: string) => void;}) {

  if (!users.length) {
    return (
      <div className="max-w-sm">
        <Card title="Users">
          <div className="text-center py-6 text-sm text-gray-500">
            No users found
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full">
      <Card title="Send Money to Friends">

        {/* Scrollable Container */}
        <div className="max-h-[500px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-300">

          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:shadow-sm transition"
            >
              {/* User Info */}
              <div>
                <div className="text-sm font-semibold text-gray-800">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500">
                  {user.number}
                </div>
              </div>

              {/* Action */}
              <Button onClick={() => onSelectUser(user.number)}>
                Send
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}