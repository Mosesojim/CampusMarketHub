import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

export default function Faqs() {
  const faqsList = [
    {
      q: "How do I start selling on CampusMarket?",
      a: "Simply sign up with your student email, verify your identity, and you can start listing products right away from your Vendor Dashboard."
    },
    {
      q: "Is CampusMarket only for students?",
      a: "Yes, our platform is exclusively designed for verified students to ensure a safe and trustworthy community."
    },
    {
      q: "How are payments handled?",
      a: "Currently, transactions are arranged between the buyer and the seller. We highly recommend meeting in a public place on campus to exchange the item and payment."
    },
    {
      q: "What should I do if a vendor scams me?",
      a: "Please report them immediately via our 'Report a Problem' page. We will investigate and suspend their account if fraudulent activity is found."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto py-12"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
      </div>
      
      <div className="grid gap-6">
        {faqsList.map((faq, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-bold mb-3">{faq.q}</h3>
            <p className="text-muted-foreground">{faq.a}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
