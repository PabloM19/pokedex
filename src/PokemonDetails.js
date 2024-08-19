import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function PokemonDetails() {
  const { id } = useParams(); // Obtenemos el ID del Pokémon desde la URL
  const [pokemon, setPokemon] = useState(null);
  const [evolution, setEvolution] = useState(null); // Estado para la información evolutiva

  useEffect(() => {
    // Función para obtener detalles del Pokémon
    const getPokemonDetails = async () => {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await response.json();
      setPokemon(data);
      
      // Obtener detalles de la especie para acceder a la cadena evolutiva
      const speciesResponse = await fetch(data.species.url);
      const speciesData = await speciesResponse.json();
      
      // Obtener la URL de la cadena evolutiva y luego la cadena evolutiva
      const evolutionChainResponse = await fetch(speciesData.evolution_chain.url);
      const evolutionChainData = await evolutionChainResponse.json();
      
      // Determinar la etapa evolutiva del Pokémon actual
      const evolutionDetails = getEvolutionStage(evolutionChainData.chain, data.name);
      setEvolution(evolutionDetails);
    };

    getPokemonDetails();
  }, [id]);

  // Función para determinar la etapa evolutiva
  const getEvolutionStage = (chain, pokemonName) => {
    let stage = { stage: "Básico", evolutions: [] };
    let currentStage = { stage: "Básico", evolutions: [] };
    
    const traverseChain = (chain, level = 0) => {
      if (chain.species.name === pokemonName) {
        currentStage.stage = level === 0 ? "Básico" : level === 1 ? "Fase 1" : "Fase 2";
        currentStage.evolutions = chain.evolves_to.map(evo => evo.species.name);
      }
      
      chain.evolves_to.forEach(evo => traverseChain(evo, level + 1));
    };
    
    traverseChain(chain);
    return currentStage;
  };

  if (!pokemon || !evolution) {
    return <div className="text-center mt-5">Cargando detalles...</div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">{pokemon.name.toUpperCase()}</h1>
      <div className="row">
        <div className="col-md-6 offset-md-3 text-center">
          <img
            src={pokemon.sprites.front_default}
            alt={pokemon.name}
            className="img-fluid mb-4"
          />
          
          {/* Información básica */}
          <ul className="list-group mb-4">
            <li className="list-group-item">Altura: {pokemon.height / 10} m</li>
            <li className="list-group-item">Peso: {pokemon.weight / 10} kg</li>
            <li className="list-group-item">
              Habilidades: {pokemon.abilities.map((ability) => ability.ability.name).join(', ')}
            </li>
            <li className="list-group-item">
              Tipo: {pokemon.types.map((type) => type.type.name).join(', ')}
            </li>
          </ul>

          {/* Estadísticas */}
          <h4 className="text-center">Estadísticas</h4>
          <ul className="list-group mb-4">
            {pokemon.stats.map((stat) => (
              <li key={stat.stat.name} className="list-group-item">
                {stat.stat.name.toUpperCase()}: {stat.base_stat}
              </li>
            ))}
          </ul>

          {/* Evolución */}
          <h4 className="text-center">Evolución</h4>
          <ul className="list-group mb-4">
            <li className="list-group-item">Etapa Evolutiva: {evolution.stage}</li>
            {evolution.evolutions.length > 0 && (
              <li className="list-group-item">
                Evoluciones: {evolution.evolutions.join(', ')}
              </li>
            )}
          </ul>

          {/* Movimientos */}
          <h4 className="text-center">Movimientos</h4>
          <ul className="list-group mb-4">
            {pokemon.moves.slice(0, 10).map((move, index) => (
              <li key={index} className="list-group-item">
                {move.move.name}
              </li>
            ))}
          </ul>

          {/* Sprites alternativos */}
          <h4 className="text-center">Sprites (Formas Alternativas)</h4>
          <div className="d-flex justify-content-center flex-wrap">
            {Object.keys(pokemon.sprites).map((key) => {
              const sprite = pokemon.sprites[key];
              if (sprite && typeof sprite === 'string') {
                return (
                  <img
                    key={key}
                    src={sprite}
                    alt={`${pokemon.name} ${key}`}
                    className="img-fluid m-2"
                    style={{ width: '100px' }}
                  />
                );
              }
              return null;
            })}
          </div>
          
          {/* Movimientos totales */}
          <p className="mt-4">Total de Movimientos: {pokemon.moves.length}</p>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetails;
