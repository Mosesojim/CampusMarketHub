import { Users, Shield, Zap } from "lucide-react";

export default function About() {
  return (
    <div className="container py-16 mx-auto max-w-4xl px-4 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">About CampusMarket</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          CampusMarket is a secure, student-exclusive marketplace designed to make buying, selling, and exchanging items within the campus community easier than ever.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-card border border-border p-8 rounded-3xl text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-2xl mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3">Safe & Secure</h3>
          <p className="text-muted-foreground">Every vendor is verified using their student matriculation ID, ensuring a trusted environment.</p>
        </div>
        
        <div className="bg-card border border-border p-8 rounded-3xl text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-2xl mb-6">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3">Community First</h3>
          <p className="text-muted-foreground">Built by students, for students. We understand the unique needs of campus life.</p>
        </div>
        
        <div className="bg-card border border-border p-8 rounded-3xl text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-2xl mb-6">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-3">Fast & Easy</h3>
          <p className="text-muted-foreground">List your items in minutes and find what you need with our powerful search and categories.</p>
        </div>
      </div>
    </div>
  );
}
