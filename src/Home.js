import './Home.css';
import Pagination from './Pagination';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [pokemons, setPokemons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pokemonsPerPage] = useState(9);

  useEffect(() => {
    const getAllPokemon = async () => {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000&offset=0');
      const listaJsonPokemon = await response.json();

      const pokemonDetails = await Promise.all(
        listaJsonPokemon.results.map(async (pokemon) => {
          const response = await fetch(pokemon.url);
          return await response.json();
        })
      );

      setPokemons(pokemonDetails);
    };
    getAllPokemon();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const filteredPokemons = pokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchTerm)
  );

  const indexOfLastPokemon = currentPage * pokemonsPerPage;
  const indexOfFirstPokemon = indexOfLastPokemon - pokemonsPerPage;
  const currentPokemons = filteredPokemons.slice(indexOfFirstPokemon, indexOfLastPokemon);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const typeColors = {
    normal: '#A8A77A',
    fuego: '#EE8130',
    agua: '#6390F0',
    eléctrico: '#F7D02C',
    planta: '#7AC74C',
    hielo: '#96D9D6',
    lucha: '#C22E28',
    veneno: '#A33EA1',
    tierra: '#E2BF65',
    volador: '#A98FF3',
    psíquico: '#F95587',
    bicho: '#A6B91A',
    roca: '#B6A136',
    fantasma: '#735797',
    dragón: '#6F35FC',
    siniestro: '#705746',
    acero: '#B7B7CE',
    hada: '#D685AD',
  };

  const typeTranslations = {
    normal: 'Normal',
    fire: 'Fuego',
    water: 'Agua',
    electric: 'Eléctrico',
    grass: 'Planta',
    ice: 'Hielo',
    fighting: 'Lucha',
    poison: 'Veneno',
    ground: 'Tierra',
    flying: 'Volador',
    psychic: 'Psíquico',
    bug: 'Bicho',
    rock: 'Roca',
    ghost: 'Fantasma',
    dragon: 'Dragón',
    dark: 'Siniestro',
    steel: 'Acero',
    fairy: 'Hada',
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Lista de Pokémon</h1>

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

      <div className="row">
        {currentPokemons.map((pokemon) => (
          <div className="col-sm-6 col-md-4 col-lg-4 mb-4" key={pokemon.id}>
            <div
              className="card h-100"
              style={{
                backgroundColor: `${typeColors[typeTranslations[pokemon.types[0].type.name].toLowerCase()]}4D`, // Color de fondo con un 30% de opacidad
                maxWidth:"400px",
                padding:"20px"
              }}
            >
              <div className="row no-gutters">
                <div className="col-md-8 d-flex flex-column justify-content-center p-3">
                  <h5 className="card-title">
                    #{pokemon.id} {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                  </h5>
                  <div className="mb-2">
                    {pokemon.types.map((type) => (
                      <span
                        key={type.slot}
                        className="badge badge-pill mr-2"
                        style={{
                          backgroundColor: typeColors[typeTranslations[type.type.name].toLowerCase()],
                          color: '#fff',
                        }}
                      >
                        {typeTranslations[type.type.name].charAt(0).toUpperCase() + typeTranslations[type.type.name].slice(1)}
                      </span>
                    ))}
                  </div>
                  <Link to={`/pokemon/${pokemon.id}`} className="stretched-link"></Link>
                </div>
                <div className="col-md-4 d-flex align-items-center justify-content-center">
                  <Link to={`/pokemon/${pokemon.id}`}>
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                      className="card-img"
                      alt={pokemon.name}
                      style={{ maxHeight: '150px' }}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
