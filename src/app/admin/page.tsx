import { Package, Users, IndianRupee, ArrowUpRight } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Sales", value: "₹4,52,000", icon: IndianRupee, change: "+12.5%" },
    { label: "Pending Orders", value: "48", icon: Package, change: "+4.2%" },
    { label: "Active Users", value: "1,240", icon: Users, change: "+2.1%" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif text-primary uppercase tracking-widest">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => {
           const Icon = stat.icon;
           return (
             <div key={i} className="bg-white p-6 rounded-2xl border border-primary/10 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                    <Icon size={24} />
                  </div>
                  <div className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full gap-1">
                    <ArrowUpRight size={14} /> {stat.change}
                  </div>
                </div>
                <div>
                   <h2 className="text-3xl font-medium text-primary mb-1">{stat.value}</h2>
                   <p className="text-sm text-primary/60 uppercase tracking-widest">{stat.label}</p>
                </div>
             </div>
           );
        })}
      </div>
      
      {/* Placeholder for Recent Orders Chart or Table */}
      <div className="bg-white p-8 rounded-2xl border border-primary/10 shadow-sm h-96 flex flex-col justify-center items-center text-primary/40 text-sm uppercase tracking-widest">
         [ Sales Chart Placeholder ]
      </div>
    </div>
  );
}
