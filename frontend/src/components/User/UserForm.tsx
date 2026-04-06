import React, { useState, useEffect } from 'react';

interface UserFormProps {
  initialValues?: { username: string; email: string; password?: string }; // Password might not be needed for update
  onSubmit: (userData: { username: string; email: string; password?: string }) => Promise<void>;
  formTitle: string;
  submitButtonText: string;
  onCancel?: () => void; // Optional cancel handler
}

const UserForm: React.FC<UserFormProps> = ({
  initialValues,
  onSubmit,
  formTitle,
  submitButtonText,
  onCancel,
}) => {
  const [username, setUsername] = useState(initialValues?.username || "");
  const [email, setEmail] = useState(initialValues?.email || "");
  const [password, setPassword] = useState(initialValues?.password || ""); // Only for creation
  const [message, setMessage] = useState("");

  // Effect to update form fields if initialValues change (e.g., for editing)
  useEffect(() => {
    setUsername(initialValues?.username || "");
    setEmail(initialValues?.email || "");
    // Password is intentionally not reset here if it's for an update,
    // as we don't want to clear a user's password field unintentionally.
    // If password reset is desired on edit, you'd add logic here.
  }, [initialValues]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await onSubmit({ username, email, password }); // Pass password only if it's a creation or reset
      setMessage("✅ Operation successful!"); // Generic success message
      // Clear form fields only if it's a creation operation or password reset
      if (!initialValues || initialValues.username !== username || initialValues.email !== email) {
        setUsername("");
        setEmail("");
        setPassword("");
      }
    } catch (error: any) {
      console.error(error);
      setMessage(`❌ ${error.message || "Operation failed"}`);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "20px auto", textAlign: "center", border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
      <h2>{formTitle}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {/* Only show password field for creation or if explicitly needed for update */}
        {submitButtonText === "Create User" && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        )}
        <button type="submit" style={{ backgroundColor: "#4CAF50", color: "white", padding: "10px", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          {submitButtonText}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ backgroundColor: "#f44336", color: "white", padding: "10px", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Cancel
          </button>
        )}
      </form>

      {message && <p style={{ marginTop: "15px", color: message.startsWith("✅") ? "green" : "red" }}>{message}</p>}
    </div>
  );
}

export default UserForm;