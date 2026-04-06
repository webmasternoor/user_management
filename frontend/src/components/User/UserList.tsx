// src/components/User/UserList.tsx
import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  status: string; // e.g., 'Active', 'Inactive'
  created_at: string; // Assuming a date string
}

interface UserListProps {
  users: User[]; // <-- Add this line to accept the users array
  onEdit: (user: User) => void;
  onDelete: (userId: number) => Promise<void>;
  fetchUsers: () => Promise<User[]>; // Function to fetch users
}

const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete, fetchUsers }) => { // <-- Destructure users here
  // ... rest of your UserList component code ...

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'ascending' | 'descending' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // Number of users per page

  // Remove the local 'users' state and the useEffect that fetches users,
  // as these are now managed by UserManagement and passed as props.
  // const [users, setUsers] = useState<User[]>([]);
  // useEffect(() => {
  //   const loadUsers = async () => {
  //     const fetchedUsers = await fetchUsers();
  //     setUsers(fetchedUsers);
  //   };
  //   loadUsers();
  // }, [fetchUsers]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const requestSort = (key: keyof User) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof User) => {
    if (!sortConfig || sortConfig.key !== key) {
      return '';
    }
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  // Filter and sort based on the 'users' prop received
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig) return 0;
    // Ensure we are comparing values correctly, especially for dates/numbers
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSortConfig(null);
    setCurrentPage(1);
  };

  return (
    <div style={{ margin: "20px auto", textAlign: "center", maxWidth: "900px" }}>
      <h2>User List</h2>
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <input
          type="text"
          placeholder="Search by Name or Email..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "4px", flexGrow: 1 }}
        />
        <button onClick={handleClearFilters} style={{ padding: "10px 15px", backgroundColor: "#f0ad4e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          Clear Filters
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th onClick={() => requestSort('id')} style={{ cursor: "pointer", padding: "12px", border: "1px solid #ddd", backgroundColor: "#f2f2f2" }}>
              ID{getSortIndicator('id')}
            </th>
            <th onClick={() => requestSort('username')} style={{ cursor: "pointer", padding: "12px", border: "1px solid #ddd", backgroundColor: "#f2f2f2" }}>
              Name{getSortIndicator('username')}
            </th>
            <th style={{ padding: "12px", border: "1px solid #ddd", backgroundColor: "#f2f2f2" }}>
              Email
            </th>
            <th onClick={() => requestSort('status')} style={{ cursor: "pointer", padding: "12px", border: "1px solid #ddd", backgroundColor: "#f2f2f2" }}>
              Status{getSortIndicator('status')}
            </th>
            <th onClick={() => requestSort('created_at')} style={{ cursor: "pointer", padding: "12px", border: "1px solid #ddd", backgroundColor: "#f2f2f2" }}>
              Created Date{getSortIndicator('created_at')}
            </th>
            <th style={{ padding: "12px", border: "1px solid #ddd", backgroundColor: "#f2f2f2" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.length > 0 ? (
            currentUsers.map(user => (
              <tr key={user.id}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.id}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.username}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.email}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{user.status}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{new Date(user.created_at).toLocaleDateString()}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <button onClick={() => onEdit(user)} style={{ marginRight: "5px", padding: "5px 10px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "3px" }}>Edit</button>
                  <button onClick={() => onDelete(user.id)} style={{ padding: "5px 10px", cursor: "pointer", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "3px" }}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ padding: "10px", textAlign: "center", fontStyle: "italic" }}>
                {searchTerm ? "No users found matching your search criteria." : "No users available."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "5px", marginTop: "20px" }}>
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} style={{ padding: "8px 12px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "4px" }}>
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
            <button
              key={pageNumber}
              onClick={() => paginate(pageNumber)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: currentPage === pageNumber ? "#007bff" : "white",
                color: currentPage === pageNumber ? "white" : "black"
              }}
            >
              {pageNumber}
            </button>
          ))}
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} style={{ padding: "8px 12px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "4px" }}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default UserList;