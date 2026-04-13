"use client";

import { useState, useEffect } from "react";
import { MoreVertical, Search, Check, Ban, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, isBlocked: !currentStatus }),
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, isBlocked: !currentStatus } : u));
        toast.success(currentStatus ? "User unblocked" : "User blocked");
      } else {
        toast.error("Action failed");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif text-primary uppercase tracking-widest">Users Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-primary/20 rounded-full bg-white text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-primary/10 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="animate-spin text-primary/20" size={32} />
            <span className="text-[10px] tracking-widest uppercase text-primary/40">Syncing database...</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/5 text-primary/60 uppercase tracking-widest text-xs border-b border-primary/10">
                <th className="p-4 font-medium">User ID</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium text-center">Identity</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-primary/30 uppercase tracking-widest text-[10px]">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                    <td className="p-4 text-[10px] font-mono text-primary/50">{user.id}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-primary uppercase tracking-wider">{user.name}</span>
                        <span className="text-[10px] text-primary/40">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                       <span className="text-[9px] px-2 py-0.5 bg-primary/5 text-primary/60 rounded-full uppercase tracking-widest font-bold">
                        {user.role}
                       </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                        user.isBlocked ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"
                      }`}>
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-3">
                         <button 
                           onClick={() => toggleBlock(user.id, user.isBlocked)}
                           title={user.isBlocked ? "Unblock User" : "Block User"}
                           disabled={user.role === 'admin'}
                           className={`p-2 transition-all hover:bg-primary/10 rounded-full ${
                             user.role === 'admin' ? 'opacity-20 cursor-not-allowed' : 'text-primary/50 hover:text-primary'
                           }`}
                         >
                            {user.isBlocked ? <Check size={16} className="text-green-600" /> : <Ban size={16} className="text-red-500" />}
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
