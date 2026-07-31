import { Shield, Users, AlertTriangle, MessageSquare, LifeBuoy, Mail, Download, FileText, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { motion } from "framer-motion";
import { useAuth } from "../lib/auth";
import { LogOut } from "lucide-react";

export function AdminPanel() {
  const { logout } = useAuth();
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [reportType, setReportType] = useState("subscribers");
  const [verifications, setVerifications] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    const subs = (JSON.parse(localStorage.getItem('campusmarket_subscribers') || '[]') || []);
    setSubscribers(subs);
    
    const loadedVerifications = (JSON.parse(localStorage.getItem('campusmarket_verifications') || '[]') || []);
    setVerifications(loadedVerifications);
    
    const loadedReviews = (JSON.parse(localStorage.getItem('campusmarket_reviews') || '[]') || []);
    setReviews(loadedReviews);
    
    const loadedReports = (JSON.parse(localStorage.getItem('campusmarket_reports') || '[]') || []);
    setReports(loadedReports);
    
    const loadedContacts = (JSON.parse(localStorage.getItem('campusmarket_contacts') || '[]') || []);
    setContacts(loadedContacts);
  }, []);

  const handlePublishReview = (id: string, publish: boolean) => {
    const updated = reviews.map(r => {
      if (r.id === id) {
        return { ...r, status: publish ? 'published' : 'rejected' };
      }
      return r;
    });
    setReviews(updated);
    localStorage.setItem('campusmarket_reviews', JSON.stringify(updated));
  };

  const handleUpdateVerification = (email: string, newStatus: string) => {
    const updated = verifications.map(v => 
      v.email === email ? { ...v, status: newStatus } : v
    );
    setVerifications(updated);
    localStorage.setItem('campusmarket_verifications', JSON.stringify(updated));
  };

  const downloadReportPdf = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`CampusMarket Report: ${reportType.toUpperCase()}`, 20, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    let yPos = 35;
    
    if (reportType === "subscribers") {
      if (subscribers.length === 0) {
        doc.text("No subscribers yet.", 20, yPos);
      } else {
        doc.text("Email Address", 20, yPos);
        yPos += 10;
        subscribers.forEach((email, index) => {
          doc.text(`${index + 1}. ${email}`, 20, yPos);
          yPos += 10;
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
        });
      }
    } else if (reportType === "verifications") {
      doc.text("Email | Status | Time", 20, yPos);
      yPos += 10;
      verifications.forEach((v, i) => {
        doc.text(`${i + 1}. ${v.email} - ${v.status.toUpperCase()} - ${v.time || "N/A"}`, 20, yPos);
        yPos += 10;
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      });
    } else if (reportType === "complaints") {
      doc.text("User | Rating | Status", 20, yPos);
      yPos += 10;
      reviews.forEach((r, i) => {
        doc.text(`${i + 1}. ${r.user} - ${r.rating} Stars - ${r.status.toUpperCase()}`, 20, yPos);
        yPos += 10;
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      });
    }
    
    doc.save(`campusmarket-${reportType}-report.pdf`);
  };

  
  const downloadReportsPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Problem Reports", 14, 22);
    
    doc.setFontSize(12);
    let y = 35;
    
    reports.forEach((report, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${report.type} (${report.time})`, 14, y);
      y += 6;
      doc.setFont(undefined, 'normal');
      
      const details = doc.splitTextToSize(report.details, 180);
      doc.text(details, 14, y);
      y += (details.length * 5) + 4;
      
      doc.text(`Contact: ${report.contact}`, 14, y);
      y += 10;
    });
    
    if (reports.length === 0) {
      doc.text("No reports found.", 14, y);
    }
    
    doc.save("campusmarket_reports.pdf");
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 w-full max-w-6xl mx-auto"
    >
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-destructive flex items-center gap-3">
            <Shield className="h-8 w-8" />
            Admin Console
          </h1>
        <p className="text-muted-foreground mt-1">Platform oversight, verification, and support moderation.</p>
        </div>
        <button 
          onClick={() => logout()} 
          className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors rounded-xl font-medium"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Generate Reports</h3>
            <p className="text-sm text-muted-foreground">Download plain text PDF reports for your records.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <select 
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="flex h-10 w-full sm:w-48 items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="subscribers">Email Subscribers</option>
            <option value="verifications">Verification Requests</option>
            <option value="complaints">Complaints & Reviews</option>
          </select>
          <button 
            onClick={downloadReportPdf}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-6 py-2 h-10 rounded-xl text-sm font-semibold whitespace-nowrap"
          >
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Verification Reviews */}
        <div className="bg-card border border-border/50 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Verification Requests</h3>
          </div>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {verifications.length === 0 ? (
              <p className="text-muted-foreground text-sm">No pending verification requests.</p>
            ) : (
              verifications.map((item, i) => (
                <div key={i} className="flex flex-col py-3 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">{item.email}</p>
                      <p className="text-xs text-muted-foreground">{item.matricNumber}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      item.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </div>
                  </div>
                  {item.status === 'pending' && (
                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={() => handleUpdateVerification(item.email, 'resolved')}
                        className="flex-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Approve
                      </button>
                      <button 
                        onClick={() => handleUpdateVerification(item.email, 'rejected')}
                        className="flex-1 bg-destructive/10 text-destructive hover:bg-destructive/20 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Newsletter Subscribers */}
        <div className="bg-card border border-border/50 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Email Subscribers</h3>
          </div>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {subscribers.length === 0 ? (
              <p className="text-muted-foreground text-sm">No subscribers yet.</p>
            ) : (
              subscribers.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium">{item}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Complaints & Reviews */}
        <div className="bg-card border border-border/50 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Complaints & Reviews</h3>
          </div>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {reviews.map((item, i) => (
              <div key={i} className="flex flex-col py-3 border-b border-border/50 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{item.subject}</p>
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    item.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-muted-foreground">{item.user}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Reports & Contacts */}
        <div className="bg-card border border-border/50 rounded-3xl p-6 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">User Reports & Support Messages</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              
            <div className="flex justify-between items-center sticky top-0 bg-card py-2">
              <h4 className="font-medium text-muted-foreground">Problem Reports</h4>
              <button onClick={downloadReportsPdf} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors font-medium">
                <Download className="w-3 h-3" />
                Download PDF
              </button>
            </div>
              {reports.length === 0 ? <p className="text-sm text-muted-foreground">No reports found.</p> : reports.map((item, i) => (
                <div key={i} className="flex flex-col py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{item.type}</p>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              <h4 className="font-medium text-muted-foreground sticky top-0 bg-card py-2">Contact Support Messages</h4>
              {contacts.length === 0 ? <p className="text-sm text-muted-foreground">No messages found.</p> : contacts.map((item, i) => (
                <div key={i} className="flex flex-col py-3 border-b border-border/50 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                  <p className="text-xs text-primary">{item.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>

  );
}
