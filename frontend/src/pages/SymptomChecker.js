import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast.error("Please enter your symptoms");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/symptoms/analyze`, {
        symptoms_text: symptoms,
      });
      setAnalysis(response.data);
      toast.success("Analysis complete");
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      toast.error(error.response?.data?.detail || "Failed to analyze symptoms");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const p = priority?.toLowerCase();
    if (p === "high") return "text-[#C86B5E]";
    if (p === "medium") return "text-[#D4A373]";
    return "text-[#6B7C75]";
  };

  const getProbabilityIcon = (probability) => {
    const p = probability?.toLowerCase();
    if (p === "high") return <AlertCircle className="w-5 h-5 text-[#C86B5E]" strokeWidth={1.5} />;
    if (p === "medium") return <AlertTriangle className="w-5 h-5 text-[#D4A373]" strokeWidth={1.5} />;
    return <CheckCircle className="w-5 h-5 text-[#3E5C4E]" strokeWidth={1.5} />;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section with Symptom Input */}
      <div className="symptom-input-container relative py-12 sm:py-16">
        <div className="symptom-input-overlay">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl tracking-tight font-light text-[#1C352D] mb-4">
                How are you feeling today?
              </h1>
              <p className="text-base leading-relaxed text-[#6B7C75] max-w-2xl mx-auto">
                Describe your symptoms in detail and get an AI-powered analysis with possible conditions and recommendations.
              </p>
            </div>

            <div className="bg-white rounded-md border border-[#E3E8E4] p-6 shadow-sm">
              <label className="text-xs tracking-[0.2em] uppercase font-bold text-[#6B7C75] mb-3 block">
                YOUR SYMPTOMS
              </label>
              <Textarea
                data-testid="symptom-input"
                placeholder="Example: I have been experiencing a persistent headache for the past 3 days, along with mild fever and body aches..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="min-h-[120px] text-base border-[#E3E8E4] focus:border-[#3E5C4E] focus:ring-[#3E5C4E] resize-none"
              />
              <div className="mt-4 flex justify-between items-center">
                <p className="text-xs text-[#6B7C75]">
                  {symptoms.length} characters
                </p>
                <Button
                  data-testid="analyze-button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="btn-primary bg-[#3E5C4E] hover:bg-[#2F4A3E] text-white px-6"
                >
                  {loading ? "Analyzing..." : "Analyze Symptoms"}
                </Button>
              </div>
            </div>

            {/* Educational Disclaimer */}
            <div className="mt-6 p-4 bg-[#F0EAE1] rounded-md border border-[#E3E8E4]">
              <p className="text-sm text-[#6B7C75] leading-relaxed">
                <strong className="text-[#1C352D]">Important:</strong> This tool is for educational and informational purposes only. 
                It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician 
                or other qualified health provider with any questions you may have regarding a medical condition.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Possible Conditions */}
            <div data-testid="conditions-section" className="space-y-4">
              <h2 className="text-2xl sm:text-3xl tracking-tight font-medium text-[#1C352D] mb-6">
                Possible Conditions
              </h2>
              {analysis.conditions?.map((condition, index) => (
                <div
                  key={index}
                  data-testid={`condition-card-${index}`}
                  className="card-hover bg-white rounded-md border border-[#E3E8E4] p-6"
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getProbabilityIcon(condition.probability)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg sm:text-xl font-medium text-[#1C352D]">
                          {condition.name}
                        </h3>
                        <span
                          className={`text-xs tracking-[0.2em] uppercase font-bold ${
                            condition.probability?.toLowerCase() === "high"
                              ? "text-[#C86B5E]"
                              : condition.probability?.toLowerCase() === "medium"
                              ? "text-[#D4A373]"
                              : "text-[#6B7C75]"
                          }`}
                        >
                          {condition.probability}
                        </span>
                      </div>
                      <p className="text-base leading-relaxed text-[#6B7C75]">
                        {condition.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            
            <div data-testid="recommendations-section" className="space-y-4">
              <h2 className="text-2xl sm:text-3xl tracking-tight font-medium text-[#1C352D] mb-6">
                Recommended Actions
              </h2>
              {analysis.recommendations?.map((rec, index) => (
                <div
                  key={index}
                  data-testid={`recommendation-card-${index}`}
                  className="card-hover bg-white rounded-md border border-[#E3E8E4] p-6"
                >
                  <div className="mb-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg sm:text-xl font-medium text-[#1C352D]">
                        {rec.action}
                      </h3>
                      <span
                        className={`text-xs tracking-[0.2em] uppercase font-bold ${getPriorityColor(
                          rec.priority
                        )}`}
                      >
                        {rec.priority} Priority
                      </span>
                    </div>
                  </div>
                  <p className="text-base leading-relaxed text-[#6B7C75]">
                    {rec.details}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}

          {analysis.analysis_result && (
            <div className="mt-8 p-6 bg-white rounded-md border border-[#E3E8E4]" data-testid="analysis-summary">
              <h2 className="text-xl sm:text-2xl tracking-tight font-medium text-[#1C352D] mb-4">
                Analysis Summary
              </h2>
              <p className="text-base leading-relaxed text-[#6B7C75] whitespace-pre-wrap">
                {analysis.analysis_result}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;