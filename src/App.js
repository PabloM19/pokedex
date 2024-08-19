import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home'; // Importamos el componente principal
import PokemonDetails from './PokemonDetails'; // Importamos el componente de detalles
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pokemon/:id" element={<PokemonDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
