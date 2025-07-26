import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "contact_us"), {
        name: form.name,
        email: form.email,
        message: form.message,
        createdAt: Timestamp.now(),
      });
      setSubmitted(true);
    } catch (error) {
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <>
     
      
      <div className="max-w-2xl mx-auto py-12 px-4">
        <p className="mb-6"></p>
        {submitted ? (
          <div className="bg-green-100 text-green-800 p-4 rounded mb-4">Thank you for contacting us! We'll respond as soon as possible.</div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Contact Us</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Name</label>
                <input
                  name="name"
                  className="w-full border rounded px-3 py-2"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <input
                  name="email"
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Message</label>
                <textarea
                  name="message"
                  className="w-full border rounded px-3 py-2"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
              >
                Send Message
              </button>
            </form>
          </>
        )}
      </div>
    
    </>
  );
};

export default Contact;