import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';
import '../css/ProfileSettings.css';

const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      _id
      name
      email
      telephone
      avatar
    }
  }
`;

const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($name: String, $email: String, $telephone: String, $avatar: String) {
    updateUser(name: $name, email: $email, telephone: $telephone, avatar: $avatar) {
      _id
      name
      email
      telephone
      avatar
    }
  }
`;

const DELETE_AVATAR_MUTATION = gql`
  mutation DeleteAvatar {
    deleteAvatar
  }
`;

const ProfileSettings = () => {
    const [profile, setProfile] = useState({
        _id: '',
        name: '',
        email: '',
        avatar: '',           // URL of avatar from server
        telephone: '',
        bio: '',
        notifications: true,
        theme: 'light',
    });

    const [avatarPreview, setAvatarPreview] = useState('');  // Base64 or URL for preview
    const [uploading, setUploading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    // Apollo client and queries/mutations
    const client = useApolloClient();
    const { loading, error: queryError, data } = useQuery(GET_CURRENT_USER, {
        fetchPolicy: 'cache-and-network'
    });

    // Update mutation with explicit cache update
    const [updateUser] = useMutation(UPDATE_USER_MUTATION, {
        update: (cache, { data: { updateUser: updatedUser } }) => {
            // Explicitly update the cache with the current user's data
            cache.writeQuery({
                query: GET_CURRENT_USER,
                data: {
                    me: updatedUser
                }
            });
        }
    });

    // Delete avatar mutation with explicit cache update
    const [deleteAvatar] = useMutation(DELETE_AVATAR_MUTATION, {
        update: (cache) => {
            // Explicitly update the cache to remove avatar
            const data = cache.readQuery({ query: GET_CURRENT_USER });
            if (data && data.me) {
                cache.writeQuery({
                    query: GET_CURRENT_USER,
                    data: {
                        me: {
                            ...data.me,
                            avatar: null
                        }
                    }
                });
            }
        }
    });

    // Load current user profile on mount
    useEffect(() => {
        if (data && data.me) {
            const user = data.me;
            setProfile({
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar || '',
                telephone: user.telephone || '',
                bio: user.bio || '',
                notifications: true,
                theme: 'light',
            });
            if (user.avatar) {
                setAvatarPreview(user.avatar);
            }
        }
    }, [data]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Handle avatar file selection and upload
    const handleAvatarChange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size exceeds 5MB limit');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (ev) => {
            setAvatarPreview(ev.target.result);
        };
        reader.readAsDataURL(file);

        // Upload to server
        await uploadAvatar(file);
    };

    const uploadAvatar = async (file) => {
        setUploading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const token = localStorage.getItem('token') || '';
            const response = await fetch('http://localhost:4000/uploadavatar', {
                method: 'POST',
                headers: {
                    'Authorization': token,
                },
                body: formData
            });

            const data = await response.json();
            
            if (response.ok && data.url) {
                // Update user in database with new avatar URL using Apollo mutation
                // The mutation's update function will handle cache updates
                await updateUser({
                    variables: {
                        avatar: data.url
                    }
                });
                setAvatarPreview(data.url);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                setError(data.error || 'Failed to upload avatar');
            }
        } catch (err) {
            setError('Failed to upload avatar');
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAvatar = async () => {
        if (!profile.avatar) return;
        
        if (!window.confirm('Are you sure you want to delete your avatar?')) {
            return;
        }

        try {
            await deleteAvatar();
            setProfile(prev => ({
                ...prev,
                avatar: ''
            }));
            setAvatarPreview('');
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError('Failed to delete avatar');
            console.error('Delete error:', err);
        }
    };

    const handleReloadAvatar = () => {
        // Reload avatar by refetching the current user data through Apollo
        client.refetchQueries({
            include: [GET_CURRENT_USER]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Only update fields that are not empty
            const updateVars = {};
            if (profile.name) updateVars.name = profile.name;
            if (profile.email) updateVars.email = profile.email;
            if (profile.telephone) updateVars.telephone = profile.telephone;

            if (Object.keys(updateVars).length > 0) {
                await updateUser({
                    variables: updateVars
                });
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError('Failed to save profile');
            console.error('Update profile error:', err);
        }
    };

    if (loading) {
        return <div className="profile-settings"><p>Loading profile...</p></div>;
    }

    if (queryError) {
        return <div className="profile-settings"><p>Error loading profile: {queryError.message}</p></div>;
    }

    return (
        <div className="profile-settings">
            <h2>Profile Settings</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={profile.name}
                    onChange={handleChange}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={profile.email}
                    onChange={handleChange}
                />
                <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={profile.phone}
                    onChange={handleChange}
                />

                {/* avatar file input and preview */}
                <div className="avatar-group">
                    {avatarPreview && (
                        <div className="avatar-preview-container">
                            <img
                                src={avatarPreview}
                                alt="Avatar preview"
                                className="avatar-preview"
                            />
                        </div>
                    )}
                    {!avatarPreview && (
                        <div className="avatar-placeholder">No avatar</div>
                    )}
                    <div className="avatar-controls">
                        <label className="avatar-upload-btn">
                            <input
                                type="file"
                                name="avatar"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                disabled={uploading}
                                style={{ display: 'none' }}
                            />
                            {uploading ? 'Uploading...' : 'Upload Avatar'}
                        </label>
                        {profile.avatar && (
                            <>
                                <button 
                                    type="button"
                                    className="avatar-reload-btn"
                                    onClick={handleReloadAvatar}
                                    disabled={uploading}
                                >
                                    Reload Avatar
                                </button>
                                <button 
                                    type="button"
                                    className="avatar-delete-btn"
                                    onClick={handleDeleteAvatar}
                                    disabled={uploading}
                                >
                                    Delete Avatar
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <textarea
                    name="bio"
                    placeholder="Bio"
                    value={profile.bio}
                    onChange={handleChange}
                />
                <label>
                    <input
                        type="checkbox"
                        name="notifications"
                        checked={profile.notifications}
                        onChange={handleChange}
                    />
                    Enable Notifications
                </label>
                <select name="theme" value={profile.theme} onChange={handleChange}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
                <button type="submit">Save Settings gdajdaj</button>
            </form>
            {error && <p className="error">{error}</p>}
            {saved && <p className="success">Settings saved successfully!</p>}
        </div>
    );
};

export default ProfileSettings;