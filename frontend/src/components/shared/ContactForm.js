"use client";

import { useState } from 'react';
import { ArrowRight, Send } from 'lucide-react';

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    event.currentTarget.reset();
    setSent(true);
  };

  return (
    <div className="border border-gray-100 bg-white p-5 shadow-xl shadow-green-900/5 sm:p-7 lg:p-8">
      <div className="mb-6 flex flex-col gap-2 border-b border-gray-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-green-700">Send a message</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">We will get back soon</h2>
        </div>
        <Send className="hidden h-8 w-8 text-orange-500 sm:block" />
      </div>

      {sent && (
        <div className="mb-5 border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-800">
          Thanks for reaching out. Our team will contact you soon.
        </div>
      )}

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-gray-500">Name</span>
            <input
              type="text"
              name="name"
              placeholder="Your full name"
              required
              className="h-12 w-full border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-900 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-gray-500">Phone</span>
            <input
              type="tel"
              name="phone"
              placeholder="+91"
              className="h-12 w-full border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-900 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10"
            />
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">Email</span>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            className="h-12 w-full border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-900 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">Topic</span>
          <select
            name="topic"
            defaultValue=""
            required
            className="h-12 w-full border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-900 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10"
          >
            <option value="" disabled>
              Choose a support topic
            </option>
            <option>Order support</option>
            <option>Delivery question</option>
            <option>Subscription help</option>
            <option>Product quality</option>
            <option>Bulk enquiry</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-gray-500">Message</span>
          <textarea
            name="message"
            rows={5}
            placeholder="Tell us how we can help..."
            required
            className="w-full resize-none border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold leading-7 text-gray-900 outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-500/10"
          />
        </label>

        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center gap-2 bg-green-600 px-6 text-sm font-extrabold text-white shadow-md shadow-green-700/15 transition hover:bg-green-700 sm:w-auto"
        >
          Send Message
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
