"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  }

  const CONTACTS = [
    { icon: Phone,  label: "Phone",   value: "+1 (321) 654-2140",      sub: "Mon–Fri, 9am–6pm EST" },
    { icon: Mail,   label: "Email",   value: "hello@aura-store.com",   sub: "We reply within 24 hours" },
    { icon: MapPin, label: "Address", value: "123 Fashion Ave, NY 10001", sub: "New York, USA" },
    { icon: Clock,  label: "Hours",   value: "9:00 AM – 6:00 PM",      sub: "Monday to Friday" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-pink-400 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-rose-500 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-xl mx-auto">
          <p className="text-pink-400 text-sm font-semibold tracking-widest uppercase mb-3">Get in Touch</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">Contact Us</h1>
          <p className="text-gray-300 text-base leading-relaxed">
            Have a question, feedback, or just want to say hello? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {CONTACTS.map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md hover:border-pink-100 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center mx-auto mb-4">
                <c.icon className="w-5 h-5 text-pink-500" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">{c.label}</p>
              <p className="font-bold text-gray-900 text-sm">{c.value}</p>
              <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Contact Form + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Send a Message</h2>
            <p className="text-sm text-gray-400 mb-6">Fill in the form below and we&apos;ll get back to you shortly.</p>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name *</label>
                    <input
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Sofia Ahmed"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition appearance-none"
                  >
                    <option value="">Select a subject</option>
                    <option>Order Inquiry</option>
                    <option>Return & Exchange</option>
                    <option>Product Question</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-pink-200 transition-all text-sm"
                >
                  {loading ? "Sending..." : <><Send className="w-4 h-4" /> Send Message</>}
                </button>
              </form>
            )}
          </div>

          {/* Map placeholder */}
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50 flex flex-col">
            <div className="flex-1 relative min-h-[300px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2412648718453!2d-73.98784368459266!3d40.74844047932745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sFashion%20Ave%2C%20New%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1627389052827!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: 300 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="AURA Store Location"
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <div className="p-5">
              <p className="font-semibold text-gray-800">AURA Flagship Store</p>
              <p className="text-sm text-gray-500 mt-1">123 Fashion Avenue, New York, NY 10001</p>
              <p className="text-sm text-gray-400 mt-0.5">Mon–Fri: 9am–6pm | Sat: 10am–4pm</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
