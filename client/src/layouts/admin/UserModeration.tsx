import React, { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { AuthContext } from "../../context";
import UserService from "src/classes/services/UserService";
import { IUserData, IUserDataRequest } from "@shared/interfaces";
import "./UserModeration.css";

// Type-safe column configuration
const COLUMN_HEADERS: Array<keyof IUserData> = ['id', 'name', 'email'];

type SortDirection = 'asc' | 'desc' | null;
type SortConfig = {
  key: keyof IUserData | null;
  direction: SortDirection;
};

function UserModeration(): JSX.Element {
  const authContext = useContext(AuthContext);
  const [users, setUsers] = useState<IUserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");

  const handleAuthError = useCallback((error: Error) => {
    setError(error.message);

  }, []);

  const fetchUsers = useCallback(async (): Promise<void> => {
    try {
      const fetchedUsers = await UserService.GetAllUsers();
      if (fetchedUsers) {
        setUsers(fetchedUsers);
        setError(null);
      }
    } catch (err) {
      console.error("Fetch Users - Error:", err);
      handleAuthError(err instanceof Error ? err : new Error('Failed to fetch users'));
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const handleUserClick = useCallback((user: IUserData) => {
    setSelectedUser(user);
    setEditName(user.name);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedUser(null);
    setIsEditing(false);
    setEditName("");
  }, []);

  const handleStartEdit = useCallback(() => {
    if (!selectedUser) return;
    setIsEditing(true);
    setEditName(selectedUser.name);
  }, [selectedUser]);

  const handleEditSubmit = useCallback(async () => {
    if (!selectedUser || !editName.trim()) return;
    if (editName.trim() === selectedUser.name) {
      setIsEditing(false);
      return;
    }

    const request: IUserDataRequest = { id: selectedUser.id };
    const response = await UserService.EditUser(request, { name: editName.trim() });
    console.log(response);

  }, [selectedUser, editName]);

  const handleCancelEdit = useCallback(() => {
    if (!selectedUser) return;
    setIsEditing(false);
    setEditName(selectedUser.name);
  }, [selectedUser]);

  const handleDeleteUser = useCallback(async () => {
    if (!selectedUser) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete user ${selectedUser.name}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      const request: IUserDataRequest = { id: selectedUser.id };
      await UserService.DeleteUser(request);
      
      // Remove user from local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      setSelectedUser(null);
      setError(null);
    } catch (err) {
      handleAuthError(err instanceof Error ? err : new Error('Failed to delete user'));
    } finally {
      setIsDeleting(false);
    }
  }, [selectedUser, handleAuthError]);

  const handleSort = useCallback((key: keyof IUserData) => {
    setSortConfig(prevConfig => {
      let direction: SortDirection = 'asc';
      
      if (prevConfig.key === key) {
        if (prevConfig.direction === 'asc') {
          direction = 'desc';
        } else if (prevConfig.direction === 'desc') {
          direction = null;
        }
      }

      return { key, direction };
    });
  }, []);

  const sortedUsers = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return users;
    }

    return [...users].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue === bValue || !aValue || !bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [users, sortConfig]);

  const getSortIcon = useCallback((key: keyof IUserData): string => {
    if (sortConfig.key !== key) return '↕';
    if (sortConfig.direction === 'asc') return '↑';
    if (sortConfig.direction === 'desc') return '↓';
    return '↕';
  }, [sortConfig]);

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        {!error.includes('Unauthorized') && (
          <button 
            className="button button-primary"
            onClick={() => {
              setError(null);
              void fetchUsers();
            }}
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="user-moderation">
      <h1>User Moderation</h1>
      
      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              {COLUMN_HEADERS.map((header) => (
                <th 
                  key={header}
                  onClick={() => handleSort(header)}
                  className={`sortable ${sortConfig.key === header ? 'sorted' : ''}`}
                >
                  <div className="header-content">
                    <span>{header}</span>
                    <span className="sort-icon">{getSortIcon(header)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user) => (
              <tr 
                key={user.id}
                onClick={() => handleUserClick(user)}
                className={selectedUser?.id === user.id ? 'selected' : ''}
              >
                {COLUMN_HEADERS.map((key) => (
                  <td key={key}>{String(user[key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <>
          <div className="modal-overlay" onClick={handleCloseDetails} />
          <div className="user-details-modal">
            <div className="modal-header">
              <h2>User Details</h2>
              <button 
                className="button button-close" 
                onClick={handleCloseDetails}
                aria-label="Close details"
              >
                ×
              </button>
            </div>
            <div className="details-table-container">
              <table className="details-table">
                <tbody>
                  {Object.entries(selectedUser).map(([key, value]) => (
                    <tr key={key}>
                      <th>{key}</th>
                      <td>
                        {key === 'name' && isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="edit-input"
                            autoFocus
                          />
                        ) : (
                          String(value)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="action-buttons">
              {isEditing ? (
                <>
                  <button 
                    className="button button-primary"
                    onClick={handleEditSubmit}
                    disabled={!editName.trim() || editName === selectedUser.name}
                  >
                    Save
                  </button>
                  <button 
                    className="button button-secondary"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  className="button button-primary"
                  onClick={handleStartEdit}
                >
                  Edit Name
                </button>
              )}
              <button 
                className="button button-danger"
                onClick={handleDeleteUser}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default UserModeration;
