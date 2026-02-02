import { Outlet} from 'react-router-dom';
import AuthClientHeader from './components/AuthClientHeader';
import AuthClientFooter from './components/AuthClientFooter';

const AuthClientLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AuthClientHeader />
      <Outlet />
      <AuthClientFooter />
    </div>
  );
};

export default AuthClientLayout;
