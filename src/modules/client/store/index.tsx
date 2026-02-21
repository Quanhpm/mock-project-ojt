import { StorePage } from './pages/StorePage';
import { location } from '@/mockdata';
import type { Store } from '@/types';

/**
 * Location Page Wrapper
 * Import mock location data và pass vào StorePage
 */
const LocationPage = () => {
  return <StorePage stores={location as Store[]} />;
};

export default LocationPage;
