import { motion } from "framer-motion";
import { ShieldCheck, MapPin, Eye, Info } from "lucide-react";

export default function Safety() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto py-12"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold">Safety Guidelines</h1>
      </div>
      
      <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
        Your safety is our top priority. Please review our safety recommendations below before completing any transactions on CampusMarket.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-6 rounded-2xl shadow-sm border border-border"
        >
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold mb-3">Meet in Open Places</h3>
          <p className="text-muted-foreground">Always arrange to meet buyers or sellers in well-lit, public areas on campus such as the library, cafeteria, or student union. Never go to an isolated location.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-6 rounded-2xl shadow-sm border border-border"
        >
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold mb-3">Verify In-Person</h3>
          <p className="text-muted-foreground">Inspect the item thoroughly before handing over any payment. Ensure it matches the description provided in the listing.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card p-6 rounded-2xl shadow-sm border border-border"
        >
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
            <Info className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold mb-3">No Advance Payments</h3>
          <p className="text-muted-foreground">Do not send money online before you have seen the item and verified the seller in person. Cash upon meeting is the safest method.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card p-6 rounded-2xl shadow-sm border border-border"
        >
          <div className="w-10 h-10 bg-destructive/10 text-destructive rounded-lg flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold mb-3">Trust Your Instincts</h3>
          <p className="text-muted-foreground">If a deal feels too good to be true or a buyer/seller is acting suspiciously, cancel the meetup immediately and report them.</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
