import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function Privacy() {
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
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
      </div>
      
      <div className="prose prose-slate max-w-none text-muted-foreground space-y-6">
        <p>Effective Date: {new Date().getFullYear()}</p>
        <p>CampusMarket is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our application.</p>
        
        <h3 className="text-xl font-bold text-foreground">1. Information We Collect</h3>
        <p>We may collect information about you in a variety of ways. The information we may collect includes your student email, name, and matriculation number for verification purposes. We also store the listings you create, messages sent, and other interactions on the platform.</p>
        
        <h3 className="text-xl font-bold text-foreground">2. Use of Your Information</h3>
        <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to create and manage your account, verify your student status, and facilitate transactions.</p>
        
        <h3 className="text-xl font-bold text-foreground">3. Disclosure of Your Information</h3>
        <p>We may share information we have collected about you in certain situations. For instance, basic profile details (name and verified status) are visible to other users when you interact with them. We do not sell your personal data to third parties.</p>
      </div>
    </motion.div>
  );
}
