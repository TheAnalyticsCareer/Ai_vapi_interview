import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { isAdminEmail } from "@/hooks/adminUtils";

interface Props {
  userId?: string; // allow undefined
  userEmail: string;
  onClose: () => void;
}

const CreateTemplateModal = ({ userId, userEmail, onClose }: Props) => {
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkAdmin = async () => {
      if (userEmail) {
        const admin = await isAdminEmail(userEmail);
        if (mounted) setIsAdmin(admin);
      }
    };
    checkAdmin();
    return () => { mounted = false; };
  }, [userEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert("User not logged in. Please log in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      if (isAdmin) {
        // Save to global_templates
        await addDoc(collection(db, "global_templates"), {
          title,
          role,
          description,
          duration,
          createdAt: new Date(),
        });
      } else {
        // Save to user-specific templates
        await addDoc(collection(db, "users", userId, "templates"), {
          title,
          role,
          description,
          duration,
          createdAt: new Date(),
        });
      }
      onClose();
    } catch (err) {
      alert("Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        className="bg-white rounded-lg p-6 w-full max-w-md space-y-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold mb-2">Create New Template</h2>
        <input
          className="w-full border p-2 rounded"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Role"
          value={role}
          onChange={e => setRole(e.target.value)}
          required
        />
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Duration (e.g. 30min)"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          required
        />
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTemplateModal;