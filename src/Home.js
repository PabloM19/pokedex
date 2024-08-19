import './App.css';
import Pagination from './Pagination';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [pokemons, setPokemons] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para la búsqueda
  const [currentPage, setCurrentPage] = useState(1); // Estado para la página actual
  const [pokemonsPerPage] = useState(9); // Fijamos 9 pokémon por página

  useEffect(() => {
    const getAllPokemon = async () => {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000&offset=0');
      const listaJsonPokemon = await response.json();
      setPokemons(listaJsonPokemon.results);
    };
    getAllPokemon();
  }, []);

  // Función que maneja el cambio en el input de búsqueda
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
    setCurrentPage(1); // Reinicia la página actual cuando se realiza una búsqueda
  };

  // Filtramos los pokémon en base al término de búsqueda
  const filteredPokemons = pokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchTerm)
  );

  // Calcular el índice de los pokémon que se muestran en la página actual
  const indexOfLastPokemon = currentPage * pokemonsPerPage;
  const indexOfFirstPokemon = indexOfLastPokemon - pokemonsPerPage;
  const currentPokemons = filteredPokemons.slice(indexOfFirstPokemon, indexOfLastPokemon);

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Lista de Pokémon</h1>

      {/* Barra de búsqueda */}
      <div className="row mb-4">
        <div className="col-md-6 offset-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Busca un Pokémon..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Mostrar los pokémon filtrados */}
      <div className="row">
        {currentPokemons.map((pokemon) => (
          <div className="col-sm-6 col-md-4 col-lg-3 mb-4" key={pokemon.name}>
            <div className="card text-center h-100">
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url.split('/')[6]}.png`}
                className="card-img-top"
                alt={pokemon.name}
              />
              <div className="card-body">
                <h5 className="card-title">{pokemon.name}</h5>
                <Link to={`/pokemon/${pokemon.url.split('/')[6]}`} className="btn btn-primary">
                  Ver detalles
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="row">
        <div className="col text-center">
          <Pagination
            pokemonsPerPage={pokemonsPerPage}
            totalPokemons={filteredPokemons.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
