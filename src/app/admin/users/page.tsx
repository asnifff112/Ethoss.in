"use client";

import { useState } from "react";
import { MoreVertical, Search, Check, Ban } from "lucide-react";

const MOCK_USERS = [
  { id: "U-1021", name: "Rahul Sharma", email: "rahul@example.com", joined: "12 Oct 2025", isBlocked: false },
  { id: "U-1022", name: "Priya Nair", email: "priya@example.com", joined: "14 Oct 2025", isBlocked: false },
  { id: "U-1023", name: "Anil Kumar", email: "anil.k@example.com", joined: "20 Oct 2025", isBlocked: true },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(MOCK_USERS);

  const toggleBlock = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, isBlocked: !u.isBlocked } : u));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif text-primary uppercase tracking-widest">Users Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="pl-10 pr-4 py-2 border border-primary/20 rounded-full bg-white text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-primary/5 text-primary/60 uppercase tracking-widest text-xs border-b border-primary/10">
              <th className="p-4 font-medium">User ID</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                <td className="p-4 text-sm font-medium text-primary">{user.id}</td>
                <td className="p-4 text-sm text-primary">{user.name}</td>
                <td className="p-4 text-sm text-primary/70">{user.email}</td>
                <td className="p-4 text-sm text-primary/70">{user.joined}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-widest ${
                    user.isBlocked ? "bg-red-50 text-red-600 border border-red-200" : "bg-green-50 text-green-600 border border-green-200"
                  }`}>
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-3">
                     <button 
                       onClick={() => toggleBlock(user.id)}
                       title={user.isBlocked ? "Unblock User" : "Block User"}
                       className="p-2 text-primary/50 hover:text-primary transition-colors hover:bg-primary/10 rounded-full"
                     >
                        {user.isBlocked ? <Check size={16} className="text-green-600" /> : <Ban size={16} className="text-red-500" />}
                     </button>
                     <button className="p-2 text-primary/50 hover:text-primary transition-colors hover:bg-primary/10 rounded-full">
                       <MoreVertical size={16} />
                     </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
