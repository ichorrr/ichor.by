import React, { useEffect } from 'react';
import ProfileSettings from '../components/ProfileSettings';

const SettingsPage = () => {
  useEffect(() => { document.title = 'Settings - ICHOR.BY'; }, []);
  return (
    <div style={{ padding: 18 }}>
      <ProfileSettings />
    </div>
  );
};

export default SettingsPage;
