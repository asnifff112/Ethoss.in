"use client";

import { useEffect, useState } from "react";
import { UserX, UserCheck, Shield } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBlocked: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlockStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isBlocked: !currentStatus }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Failed to update user", error);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-primary uppercase tracking-widest flex items-center gap-3">
          <Shield size={24} /> User Management
        </h1>
        <p className="text-sm text-primary/60 mt-2">View and manage registered customers.</p>
      </div>

      {loading ? (
        <p className="text-primary/50 text-sm">Loading users...</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-primary/10 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-primary/5 border-b border-primary/10">
              <tr>
                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase text-primary/70">Name</th>
                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase text-primary/70">Email</th>
                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase text-primary/70">Role</th>
                <th className="px-6 py-4 text-xs font-bold tracking-widest uppercase text-primary/70 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {users.map((user) => (
                <tr key={user._id} className={`transition-colors ${user.isBlocked ? 'bg-red-50/50' : 'hover:bg-primary/5'}`}>
                  <td className="px-6 py-4 text-sm font-medium text-primary">
                    {user.name}
                    {user.isBlocked && <span className="ml-2 text-[10px] text-red-500 font-bold uppercase">Blocked</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-primary/70">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-primary/70 capitalize">{user.role}</td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== "admin" && (
                      <button
                        onClick={() => toggleBlockStatus(user._id, user.isBlocked)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold tracking-wide uppercase transition-colors ${
                          user.isBlocked 
                            ? "bg-green-100 text-green-700 hover:bg-green-200" 
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {user.isBlocked ? (
                          <><UserCheck size={14} /> Unblock</>
                        ) : (
                          <><UserX size={14} /> Block</>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
