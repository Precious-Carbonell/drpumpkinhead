import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ParallaxBackground from './components/ParallaxBackground';
import PetalParticles from './components/PetalParticles';
import CursorPetals from './components/CursorPetals';
import MusicPlayer from './components/MusicPlayer';
import Home from './pages/Home';
import PriceList from './pages/PriceList';
import Queue from './pages/Queue';
import Socials from './pages/Socials';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Commissions from './pages/admin/Commissions';
import Clients from './pages/admin/Clients';
import Prices from './pages/admin/Prices';
import Users from './pages/admin/Users';
import AuditLogs from './pages/admin/AuditLogs';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public client routes */}
        <Route path="/" element={<><ParallaxBackground /><PetalParticles /><CursorPetals /><Navbar /><MusicPlayer /><Home /><Footer /></>} />
        <Route path="/prices" element={<><ParallaxBackground /><PetalParticles /><CursorPetals /><Navbar /><MusicPlayer /><PriceList /><Footer /></>} />
        <Route path="/queue" element={<><ParallaxBackground /><PetalParticles /><CursorPetals /><Navbar /><MusicPlayer /><Queue /><Footer /></>} />
        <Route path="/socials" element={<><ParallaxBackground /><PetalParticles /><CursorPetals /><Navbar /><MusicPlayer /><Socials /><Footer /></>} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="commissions" element={<Commissions />} />
          <Route path="clients" element={<Clients />} />
          <Route path="prices" element={<Prices />} />
          <Route path="users" element={<Users />} />
          <Route path="audit" element={<AuditLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


