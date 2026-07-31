import { motion } from "framer-motion";
import { AlertTriangle, Mail } from "lucide-react";
import React, { useState } from "react";

export default function Report() {
  const [type, setType] = useState("Fraudulent Vendor / Scammer");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReport = {
      type,
      description,
      time: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
    };
    
    const existing = JSON.parse(localStorage.getItem("campusmarket_reports") || "[]");
    localStorage.setItem("campusmarket_reports", JSON.stringify([newReport, ...existing]));
    
    setSubmitted(true);
    setType("Fraudulent Vendor / Scammer");
    setDescription("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto py-12"
    >
      <div className="bg-card rounded-3xl p-8 md:p-12 shadow-sm border border-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold">Report a Problem</h1>
        </div>
        
        <p className="text-muted-foreground mb-8 text-lg">
          We take the safety and reliability of our platform seriously. If you have encountered any issues, fraudulent activity, or inappropriate behavior, please let us know immediately.
        </p>
        
        <div className="bg-amber-500/10 text-amber-600 border border-amber-500/20 p-4 rounded-xl mb-8 flex items-start gap-3 text-sm text-left">
          <div className="mt-0.5"><AlertTriangle className="w-5 h-5" /></div>
          <p><strong>Notice:</strong> Since the webapp is in a testing phase, reports will be redirected directly to the Admin Portal instead.</p>
        </div>

        {submitted && (
          <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl mb-6 flex items-center gap-2">
            Your report has been submitted successfully. We will review it shortly.
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type of Problem</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option>Fraudulent Vendor / Scammer</option>
              <option>Inappropriate Content</option>
              <option>Technical Issue / Bug</option>
              <option>Payment Dispute</option>
              <option>Other</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[150px] rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Please describe the issue in detail..."
              required
            ></textarea>
          </div>

          <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-destructive px-8 py-3 text-sm font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-colors">
            <Mail className="w-4 h-4" />
            Submit Report
          </button>
        </form>
      </div>
    </motion.div>
  );
}
