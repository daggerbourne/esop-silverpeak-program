import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api';

const AdminDashboard = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddUser, setShowAddUser] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            await api.post('/auth/register', formData);
            setFormData({ username: '', email: '', password: '', role: 'user' });
            setShowAddUser(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to add user');
        }
    };

    const handleResetPassword = async (userId, username) => {
        const newPassword = prompt(`Enter new password for ${username}:`);
        if (!newPassword) return;

        try {
            await api.post(`/users/${userId}/reset-password`, {
                new_password: newPassword
            });
            alert(`Password reset successfully for ${username}`);
        } catch (err) {
            alert('Failed to reset password: ' + (err.response?.data?.detail || err.message));
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!confirm(`Are you sure you want to delete user ${username}?`)) return;

        try {
            await api.delete(`/users/${userId}`);
            fetchUsers();
        } catch (err) {
            alert('Failed to delete user: ' + (err.response?.data?.detail || err.message));
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>User Management</h2>
            
            {error && (
                <div style={{ 
                    backgroundColor: '#ffebee', 
                    color: '#c62828', 
                    padding: '10px', 
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    {error}
                </div>
            )}

            <button 
                onClick={() => setShowAddUser(!showAddUser)}
                style={{ marginBottom: '20px', padding: '10px 20px' }}
            >
                {showAddUser ? 'Cancel' : 'Add New User'}
            </button>

            {showAddUser && (
                <form onSubmit={handleAddUser} style={{ 
                    backgroundColor: '#f5f5f5', 
                    padding: '20px', 
                    borderRadius: '4px',
                    marginBottom: '20px'
                }}>
                    <h3>Add New User</h3>
                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            required
                            style={{ padding: '8px', marginRight: '10px', width: '200px' }}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                            style={{ padding: '8px', marginRight: '10px', width: '200px' }}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                            style={{ padding: '8px', marginRight: '10px', width: '200px' }}
                        />
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                            style={{ padding: '8px', marginRight: '10px' }}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <button type="submit" style={{ padding: '8px 16px' }}>Add User</button>
                    </div>
                </form>
            )}

            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Active</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.is_active ? '✓' : '✗'}</td>
                            <td>
                                <button 
                                    onClick={() => handleResetPassword(user.id, user.username)}
                                    style={{ marginRight: '5px', padding: '5px 10px' }}
                                >
                                    Reset Password
                                </button>
                                {user.id !== currentUser.id && (
                                    <button 
                                        onClick={() => handleDeleteUser(user.id, user.username)}
                                        style={{ padding: '5px 10px', backgroundColor: '#d32f2f', color: 'white' }}
                                    >
                                        Delete
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
