import { Outlet } from 'react-router-dom';

const AuthAdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--cf-bg)' }}>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthAdminLayout;
