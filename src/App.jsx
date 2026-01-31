import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Landing from './pages/Landing'; // Import Landing

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />        {/* Landing Page */}
        <Route path="/studio" element={<Home />} />     {/* The App */}
        <Route path="/admin" element={<Admin />} />     {/* Admin */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;