import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";

interface PaymentFormModalProps {
  open: boolean;
  onClose: () => void;
  upiUrl: string;
  onSubmit: (form: any) => void;
  loading?: boolean;
  defaultPlan?: string;
}

const PaymentFormModal = ({
  open,
  onClose,
  upiUrl,
  onSubmit,
  loading,
  defaultPlan = "Free",
}: PaymentFormModalProps) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    experience: "",
    plan: defaultPlan,
    txnId: "",
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, plan: defaultPlan }));
  }, [defaultPlan]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation
    if (!form.fullName || !form.email || !form.mobile || !form.plan) {
      alert("Please fill all required fields.");
      return;
    }
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 p-4">
      <Dialog.Panel className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-6 sm:p-10 text-left">
        <Dialog.Title className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Complete Your Registration
        </Dialog.Title>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              name="fullName"
              placeholder="Enter your full name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input
              name="mobile"
              type="tel"
              placeholder="Enter your mobile number"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
              value={form.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Plan</label>
            <select
              name="plan"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg"
              value={form.plan}
              onChange={handleChange}
              required
            >
              <option value="Free">Free</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
              <option value="Student">Academia/Enterprises</option>
            </select>
          </div>

          {/* Optional: You can show QR Code here if needed */}
          {/* <div className="flex justify-center">
            <QRCodeSVG value={upiUrl} size={150} />
          </div> */}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold transition duration-200"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </Dialog.Panel>
    </Dialog>
  );
};

export default PaymentFormModal;
