import { motion } from "framer-motion";
import { Users } from "lucide-react";

export default function CommunityRules() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto py-12"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <Users className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold">Community Rules</h1>
      </div>
      
      <div className="prose prose-slate max-w-none text-muted-foreground space-y-6">
        <p>To maintain a safe and friendly environment for all students, we ask that you follow these simple community rules.</p>
        
        <ul className="list-disc pl-6 space-y-4">
          <li><strong className="text-foreground">Respect Each Other:</strong> Be polite in your communications. Harassment, hate speech, or abuse will lead to immediate account suspension.</li>
          <li><strong className="text-foreground">Honest Listings:</strong> Describe your items accurately. Do not post misleading photos or hide defects.</li>
          <li><strong className="text-foreground">Prohibited Items:</strong> Do not list illegal items, weapons, drugs, or academically dishonest materials (e.g., stolen exams, essays for sale).</li>
          <li><strong className="text-foreground">Show Up:</strong> If you arrange a meeting with a buyer or seller, please show up on time. If you need to cancel, let them know as soon as possible.</li>
          <li><strong className="text-foreground">Report Bad Actors:</strong> If you encounter someone breaking these rules, please use the Report feature so our admin team can take action.</li>
        </ul>
      </div>
    </motion.div>
  );
}
