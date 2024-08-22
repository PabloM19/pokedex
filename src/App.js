import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home'; // Importamos el componente principal
import PokemonDetails from './PokemonDetails'; // Importamos el componente de detalles
import 'bootstrap/dist/css/bootstrap.min.css';
import PokemonComparison from './PokemonComparision';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pokemon/:id" element={<PokemonDetails />} />
        <Route path="/comparar" element={<PokemonComparison />} />
      </Routes>
    </Router>
  );
}

export default App;