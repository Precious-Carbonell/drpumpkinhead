import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ParallaxBackground from './components/ParallaxBackground';
import PetalParticles from './components/PetalParticles';
import Home from './pages/Home';
import PriceList from './pages/PriceList';
import Queue from './pages/Queue';
import Socials from './pages/Socials';

export default function App() {
  return (
    <BrowserRouter>
      <ParallaxBackground />
      <PetalParticles />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/prices" element={<PriceList />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/socials" element={<Socials />} />
      </Routes>
    </BrowserRouter>
  );
}
