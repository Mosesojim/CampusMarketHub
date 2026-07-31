import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function Terms() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto py-12"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold">Terms of Service</h1>
      </div>
      
      <div className="prose prose-slate max-w-none text-muted-foreground space-y-6">
        <p>Welcome to CampusMarket. By accessing or using our platform, you agree to be bound by these Terms of Service.</p>
        
        <h3 className="text-xl font-bold text-foreground">1. Eligibility</h3>
        <p>You must be a currently enrolled student at the university with a valid student email address to use this platform.</p>
        
        <h3 className="text-xl font-bold text-foreground">2. User Responsibilities</h3>
        <p>You are responsible for all activities under your account. You agree not to post false, inaccurate, misleading, defamatory, or libelous content.</p>
        
        <h3 className="text-xl font-bold text-foreground">3. Transactions</h3>
        <p>CampusMarket serves as a digital venue for students to meet and trade. We do not own the items listed, nor do we guarantee the quality, safety, or legality of items advertised. You agree that any transaction is made solely between the buyer and seller.</p>
      </div>
    </motion.div>
  );
}
