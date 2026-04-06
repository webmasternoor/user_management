// src/components/User/UserManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import UserForm from './UserForm';
import UserList from './UserList';

// Define the User interface here if not already defined globally
interface User {
  id: number;
  username: string;
  email: string;
  status: string; // e.g., 'Active', 'Inactive'
  created_at: string; // Assuming a date string
}

const UserManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]); // State to hold users for UserList
  const [message, setMessage] = useState(""); // For general feedback

  // --- API Interaction Functions ---

  const fetchUsers = useCallback(async () => {
    try {
      // Ensure your Flask API returns the full User object as expected by the User interface
      const response = await fetch("http://127.0.0.1:5000/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data: User[] = await response.json();
      setUsers(data);
      return data;
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setMessage(`Error loading users: ${error.message}`);
      return [];
    }
  }, []);

  const createUser = async (userData: { username: string; email: string; password?: string }) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        let errorMessage = "Failed to create user";
        try {
          // Attempt to parse JSON error message from Flask
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || "Failed to create user";
        } catch (parseError) {
          // If response is not JSON, use status text or a default
          errorMessage = response.statusText || "Failed to create user";
        }
        throw new Error(errorMessage);
      }

      await fetchUsers(); // Refresh the list
      setShowForm(false); // Close form after successful creation
      setEditingUser(null);
      setMessage("User created successfully"); // Set a general success message
      return { success: true, message: "User created successfully" };
    } catch (error: any) {
      console.error("Error creating user:", error);
      setMessage(`Error: ${error.message}`); // Display the specific error message
      throw error; // Re-throw to be caught by UserForm
    }
  };

  const updateUser = async (userId: number, userData: { username: string; email: string }) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }
      await fetchUsers(); // Refresh the list
      setShowForm(false);
      setEditingUser(null);
      setMessage("User updated successfully"); // Set a general message
      return { success: true, message: "User updated successfully" };
    } catch (error: any) {
      console.error("Error updating user:", error);
      setMessage(`Error: ${error.message}`); // Display error message
      throw error; // Re-throw to be caught by UserForm
    }
  };

  const deleteUser = async (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/users/${userId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete user");
        }
        await fetchUsers(); // Refresh the list
        setMessage("User deleted successfully"); // Set a general message
      } catch (error: any) {
        console.error("Error deleting user:", error);
        setMessage(`Error: ${error.message}`); // Display error message
      }
    }
  };

  // Handler to prepare for editing
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  // Handler to close the form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  // Handler for the form submission (either create or update)
  const handleFormSubmit = async (userData: { username: string; email: string; password?: string }) => {
    if (editingUser) {
      // Update existing user
      await updateUser(editingUser.id, { username: userData.username, email: userData.email });
    } else {
      // Create new user
      await createUser(userData);
    }
  };

  // Initial fetch of users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>User Management</h1>

      {/* Button to show the form for adding a new user */}
      {!showForm && (
        <button
          onClick={() => {
            setEditingUser(null); // Ensure no user is pre-selected for editing
            setShowForm(true);
          }}
          style={{ marginBottom: "20px", padding: "10px 15px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Add New User
        </button>
      )}

      {/* Display the form if showForm is true */}
      {showForm && (
        <UserForm
          formTitle={editingUser ? "Edit User" : "Create New User"}
          submitButtonText={editingUser ? "Update User" : "Create User"}
          initialValues={editingUser ? { username: editingUser.username, email: editingUser.email } : undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
        />
      )}

      {/* Display the user list */}
      <UserList
        users={users} // Pass users state to UserList
        onEdit={handleEdit}
        onDelete={deleteUser}
        fetchUsers={fetchUsers} // Pass fetchUsers to UserList for its internal use
      />

      {/* Display general messages */}
      {message && <p style={{ marginTop: "20px", color: message.startsWith("✅") ? "green" : "red" }}>{message}</p>}
    </div>
  );
}

export default UserManagement;