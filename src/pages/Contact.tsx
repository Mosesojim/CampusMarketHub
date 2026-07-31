import {  Mail, MapPin, Phone , AlertTriangle } from "lucide-react";
import React, { useState } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newContact = {
      name,
      email,
      message,
      time: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
    };
    
    const existing = JSON.parse(localStorage.getItem("campusmarket_contacts") || "[]");
    localStorage.setItem("campusmarket_contacts", JSON.stringify([newContact, ...existing]));
    
    setSubmitted(true);
    setName("");
    setEmail("");
    setMessage("");
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="container py-16 mx-auto max-w-5xl px-4 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">Contact Us</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Have a question, suggestion, or need help? We're here for you.
        </p>
      </div>
      
      <div className="bg-amber-500/10 text-amber-600 border border-amber-500/20 p-4 rounded-xl mb-8 flex items-start gap-3 text-sm text-left max-w-3xl mx-auto">
        <div className="mt-0.5"><AlertTriangle className="w-5 h-5" /></div>
        <p><strong>Notice:</strong> Since the webapp is in a testing phase, the email, phone, and address provided are not real. Any messages sent here will be redirected to the Admin Portal instead.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-lg">Email Support</h3>
              <p className="text-muted-foreground">support@campusmarket.edu</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-lg">Phone</h3>
              <p className="text-muted-foreground">+1 (555) 123-4567</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium text-lg">Office</h3>
              <p className="text-muted-foreground">Student Union Building, Room 204</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-8 rounded-3xl">
          {submitted && (
            <div className="bg-emerald-100 text-emerald-800 p-4 rounded-xl mb-6">
              Thank you for contacting us! We'll get back to you shortly.
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                placeholder="Your name" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                placeholder="your@email.edu" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[120px]" 
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <button className="w-full h-12 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
