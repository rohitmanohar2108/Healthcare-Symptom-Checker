import { useState, useEffect } from "react";
import axios from "axios";
import { Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API}/symptoms/history`);
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="loading-pulse text-[#6B7C75]">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F9F8F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl tracking-tight font-light text-[#1C352D] mb-4">
            Symptom Check History
          </h1>
          <p className="text-base leading-relaxed text-[#6B7C75]">
            Review your previous symptom analyses and track your health journey.
          </p>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12" data-testid="no-history-message">
            <Clock className="w-16 h-16 text-[#E3E8E4] mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-lg text-[#6B7C75]">No symptom checks yet</p>
            <p className="text-sm text-[#6B7C75] mt-2">Start by checking your symptoms on the home page</p>
          </div>
        ) : (
          <div className="space-y-6" data-testid="history-list">
            {history.map((check, index) => (
              <div
                key={check.id}
                data-testid={`history-item-${index}`}
                className="card-hover bg-white rounded-md border border-[#E3E8E4] p-6 fade-in"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-[#3E5C4E]" strokeWidth={1.5} />
                    <span className="text-sm text-[#6B7C75]">
                      {formatDate(check.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-xs tracking-[0.2em] uppercase font-bold text-[#6B7C75] mb-2">
                    SYMPTOMS
                  </h3>
                  <p className="text-base leading-relaxed text-[#1C352D]">
                    {check.symptoms_text}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <h3 className="text-xs tracking-[0.2em] uppercase font-bold text-[#6B7C75] mb-3">
                      CONDITIONS IDENTIFIED
                    </h3>
                    <div className="space-y-2">
                      {check.conditions?.map((condition, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <AlertCircle className="w-4 h-4 text-[#3E5C4E]" strokeWidth={1.5} />
                          <span className="text-[#1C352D]">{condition.name}</span>
                          <span className="text-[#6B7C75]">({condition.probability})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs tracking-[0.2em] uppercase font-bold text-[#6B7C75] mb-3">
                      RECOMMENDATIONS
                    </h3>
                    <div className="space-y-2">
                      {check.recommendations?.map((rec, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="text-[#1C352D] font-medium">{rec.action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;