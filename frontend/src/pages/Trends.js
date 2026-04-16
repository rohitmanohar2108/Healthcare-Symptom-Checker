import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Activity, Clock } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const COLORS = ["#3E5C4E", "#C86B5E", "#D4A373", "#6B7C75", "#8FA89E", "#B89E82"];

const Trends = () => {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const response = await axios.get(`${API}/symptoms/trends`);
      setTrends(response.data);
    } catch (error) {
      console.error("Error fetching trends:", error);
      toast.error("Failed to load trends");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="loading-pulse text-[#6B7C75]">Loading trends...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F9F8F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl tracking-tight font-light text-[#1C352D] mb-4">
            Trend Analysis Dashboard
          </h1>
          <p className="text-base leading-relaxed text-[#6B7C75]">
            Visualize patterns in symptom checks and identify common health concerns.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-testid="summary-cards">
          <div className="card-hover bg-white rounded-md border border-[#E3E8E4] p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Activity className="w-6 h-6 text-[#3E5C4E]" strokeWidth={1.5} />
              <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#6B7C75]">
                TOTAL CHECKS
              </span>
            </div>
            <p className="text-4xl font-light text-[#1C352D]" data-testid="total-checks">
              {trends?.total_checks || 0}
            </p>
          </div>

          <div className="card-hover bg-white rounded-md border border-[#E3E8E4] p-6">
            <div className="flex items-center space-x-3 mb-2">
              <TrendingUp className="w-6 h-6 text-[#3E5C4E]" strokeWidth={1.5} />
              <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#6B7C75]">
                TOP CONDITION
              </span>
            </div>
            <p className="text-2xl font-medium text-[#1C352D]" data-testid="top-condition">
              {trends?.top_conditions?.[0]?.symptom_category || "N/A"}
            </p>
          </div>

          <div className="card-hover bg-white rounded-md border border-[#E3E8E4] p-6">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-6 h-6 text-[#3E5C4E]" strokeWidth={1.5} />
              <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#6B7C75]">
                UNIQUE CONDITIONS
              </span>
            </div>
            <p className="text-4xl font-light text-[#1C352D]" data-testid="unique-conditions">
              {trends?.top_conditions?.length || 0}
            </p>
          </div>
        </div>

        {/* Charts */}
        {trends?.top_conditions && trends.top_conditions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-white rounded-md border border-[#E3E8E4] p-6" data-testid="bar-chart">
              <h2 className="text-xl sm:text-2xl tracking-tight font-medium text-[#1C352D] mb-6">
                Top Conditions
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trends.top_conditions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E8E4" />
                  <XAxis
                    dataKey="symptom_category"
                    tick={{ fill: "#6B7C75", fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis tick={{ fill: "#6B7C75", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E3E8E4",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#3E5C4E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-md border border-[#E3E8E4] p-6" data-testid="pie-chart">
              <h2 className="text-xl sm:text-2xl tracking-tight font-medium text-[#1C352D] mb-6">
                Condition Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={trends.top_conditions}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.symptom_category}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {trends.top_conditions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E3E8E4",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px" }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-md border border-[#E3E8E4]" data-testid="no-trends-message">
            <TrendingUp className="w-16 h-16 text-[#E3E8E4] mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-lg text-[#6B7C75]">No trend data available yet</p>
            <p className="text-sm text-[#6B7C75] mt-2">
              Complete a few symptom checks to see trends
            </p>
          </div>
        )}

        {/* Detailed Table */}
        {trends?.top_conditions && trends.top_conditions.length > 0 && (
          <div className="mt-6 bg-white rounded-md border border-[#E3E8E4] p-6" data-testid="trends-table">
            <h2 className="text-xl sm:text-2xl tracking-tight font-medium text-[#1C352D] mb-6">
              Detailed Breakdown
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E3E8E4]">
                    <th className="text-left text-xs tracking-[0.2em] uppercase font-bold text-[#6B7C75] pb-3">
                      Condition
                    </th>
                    <th className="text-right text-xs tracking-[0.2em] uppercase font-bold text-[#6B7C75] pb-3">
                      Occurrences
                    </th>
                    <th className="text-right text-xs tracking-[0.2em] uppercase font-bold text-[#6B7C75] pb-3">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trends.top_conditions.map((item, index) => {
                    const percentage = ((item.count / trends.total_checks) * 100).toFixed(1);
                    return (
                      <tr key={index} className="border-b border-[#E3E8E4] last:border-0">
                        <td className="py-3 text-base text-[#1C352D]">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span>{item.symptom_category}</span>
                          </div>
                        </td>
                        <td className="py-3 text-base text-[#1C352D] text-right">
                          {item.count}
                        </td>
                        <td className="py-3 text-base text-[#6B7C75] text-right">
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trends;