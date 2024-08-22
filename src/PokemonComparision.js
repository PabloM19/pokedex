import { useState, useEffect } from 'react';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';
import './PokemonComparison.css';

function PokemonComparison() {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredPokemon1, setFilteredPokemon1] = useState([]);
  const [filteredPokemon2, setFilteredPokemon2] = useState([]);
  const [pokemon1, setPokemon1] = useState(null);
  const [pokemon2, setPokemon2] = useState(null);
  const [selectedPokemon1, setSelectedPokemon1] = useState('');
  const [selectedPokemon2, setSelectedPokemon2] = useState('');
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [result, setResult] = useState(null);
  const [selectedMoves, setSelectedMoves] = useState([]);
  const [availableMoves, setAvailableMoves] = useState([]);

  // Obtener la lista de Pokémon
  useEffect(() => {
    const fetchPokemonList = async () => {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
      const data = await response.json();
      setPokemonList(data.results);
    };
    fetchPokemonList();
  }, []);

  // Filtrar la lista de Pokémon según la búsqueda del usuario
  useEffect(() => {
    setFilteredPokemon1(
      pokemonList.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(search1.toLowerCase())
      )
    );
  }, [search1, pokemonList]);

  useEffect(() => {
    setFilteredPokemon2(
      pokemonList.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(search2.toLowerCase())
      )
    );
  }, [search2, pokemonList]);

  // Obtener detalles del primer Pokémon seleccionado
  useEffect(() => {
    if (selectedPokemon1) {
      const fetchPokemon1Details = async () => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${selectedPokemon1}`);
        const data = await response.json();
        setPokemon1(data);

        const moves = await Promise.all(
          data.moves.slice(0, 50).map(async (moveEntry) => {
            const moveResponse = await fetch(moveEntry.move.url);
            const moveData = await moveResponse.json();
            const spanishMove = moveData.names.find((name) => name.language.name === 'es');
            return { ...moveEntry, move: { ...moveEntry.move, name: spanishMove.name } };
          })
        );
        setAvailableMoves(moves);
        setSelectedMoves([]); // Reiniciar movimientos seleccionados al cambiar Pokémon
      };
      fetchPokemon1Details();
    }
  }, [selectedPokemon1]);

  // Obtener detalles del segundo Pokémon seleccionado
  useEffect(() => {
    if (selectedPokemon2) {
      const fetchPokemon2Details = async () => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${selectedPokemon2}`);
        const data = await response.json();
        setPokemon2(data);
      };
      fetchPokemon2Details();
    }
  }, [selectedPokemon2]);

  // Comparar los tipos de Pokémon y calcular la efectividad
  const comparePokemonTypes = async () => {
    if (!pokemon1 || !pokemon2 || selectedMoves.length === 0) {
      return;
    }

    const fetchTypeData = async (types) => {
      const typeRequests = types.map((type) => fetch(type.type.url).then((res) => res.json()));
      const typeData = await Promise.all(typeRequests);
      return typeData;
    };

    const pokemon2Types = await fetchTypeData(pokemon2.types);

    let effectivenessResults = selectedMoves.map(async (moveUrl) => {
      const moveResponse = await fetch(moveUrl);
      const moveData = await moveResponse.json();

      const moveNameInSpanish = moveData.names.find((name) => name.language.name === 'es').name;

      const moveType = await fetch(moveData.type.url).then((res) => res.json());
      const spanishTypeName = moveType.names.find((name) => name.language.name === 'es').name;

      let effectiveness = 1; 
      pokemon2Types.forEach((defenderType) => {
        if (moveType.damage_relations.double_damage_to.some((t) => t.name === defenderType.name)) {
          effectiveness *= 2;
        }
        if (moveType.damage_relations.half_damage_to.some((t) => t.name === defenderType.name)) {
          effectiveness *= 0.5;
        }
        if (moveType.damage_relations.no_damage_to.some((t) => t.name === defenderType.name)) {
          effectiveness *= 0;
        }
      });

      return {
        moveName: moveNameInSpanish,
        moveTypeName: spanishTypeName,
        effectiveness: effectiveness,
      };
    });

    const finalResults = await Promise.all(effectivenessResults);

    const totalEffectiveness = finalResults.reduce((acc, cur) => acc + cur.effectiveness, 0);

    const winner = totalEffectiveness > finalResults.length ? 'pokemon1' : 'pokemon2';

    setResult({ results: finalResults, winner: winner });
  };

  // Manejar la selección de movimientos
  const handleMoveSelection = (moveUrl) => {
    if (selectedMoves.includes(moveUrl)) {
      setSelectedMoves(selectedMoves.filter((url) => url !== moveUrl));
    } else if (selectedMoves.length < 4) {
      setSelectedMoves([...selectedMoves, moveUrl]);
    }
  };

  // Reiniciar la comparativa
  const resetComparison = () => {
    setSelectedPokemon1('');
    setSelectedPokemon2('');
    setSearch1('');
    setSearch2('');
    setPokemon1(null);
    setPokemon2(null);
    setSelectedMoves([]);
    setAvailableMoves([]);
    setResult(null);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Comparativa de Pokémon</h1>

      <div className="row">
        <div className="col-md-6">
          <h4>Selecciona el primer Pokémon</h4>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Busca un Pokémon"
            value={search1}
            onChange={(e) => setSearch1(e.target.value)}
          />
          <ul className="list-group">
            {filteredPokemon1.slice(0, 10).map((pokemon) => (
              <li
                key={pokemon.name}
                className="list-group-item d-flex align-items-center"
                onClick={() => setSelectedPokemon1(pokemon.name)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url
                    .split('/')
                    .slice(-2, -1)[0]}.png`}
                  alt={pokemon.name}
                  className="img-thumbnail me-2"
                  style={{ width: '40px', height: '40px' }}
                />
                {pokemon.name}
              </li>
            ))}
          </ul>

          {pokemon1 && (
            <div className="mt-4">
              <h5>Selecciona hasta 4 movimientos</h5>
              <Select
                options={availableMoves.map((move) => ({
                  value: move.move.url,
                  label: move.move.name,
                }))}
                isMulti
                value={selectedMoves.map((moveUrl) => ({
                  value: moveUrl,
                  label: availableMoves.find((move) => move.move.url === moveUrl)?.move.name,
                }))}
                onChange={(selectedOptions) =>
                  setSelectedMoves(selectedOptions.map((option) => option.value))
                }
                maxMenuHeight={120}
                isOptionDisabled={() => selectedMoves.length >= 4}
              />
            </div>
          )}
        </div>

        <div className="col-md-6">
          <h4>Selecciona el segundo Pokémon</h4>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Busca un Pokémon"
            value={search2}
            onChange={(e) => setSearch2(e.target.value)}
          />
          <ul className="list-group">
            {filteredPokemon2.slice(0, 10).map((pokemon) => (
              <li
                key={pokemon.name}
                className="list-group-item d-flex align-items-center"
                onClick={() => setSelectedPokemon2(pokemon.name)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.url
                    .split('/')
                    .slice(-2, -1)[0]}.png`}
                  alt={pokemon.name}
                  className="img-thumbnail me-2"
                  style={{ width: '40px', height: '40px' }}
                />
                {pokemon.name}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-primary" onClick={comparePokemonTypes}>
          Comprobar Efectividad
        </button>
        <button className="btn btn-secondary ms-3" onClick={resetComparison}>
          Reiniciar
        </button>
      </div>

      {result && (
        <div
          className={`alert mt-4 ${
            result.winner === 'pokemon1' ? 'alert-success' : 'alert-danger'
          }`}
        >
          <h4>Resultados de la Comparativa</h4>
          {result.results.map((res, index) => (
            <p key={index} style={{ color: res.effectiveness === 0 ? 'red' : res.effectiveness > 1 ? 'green' : 'black' }}>
              Movimiento: {res.moveName} - Tipo: {res.moveTypeName} - Efectividad: {res.effectiveness}
            </p>
          ))}
        </div>
      )}

      <div className="row mt-4">
        {pokemon1 && (
          <div
            className={`col-md-6 text-center ${result?.winner === 'pokemon1' ? 'winner' : 'loser'}`}
          >
            <h3>{pokemon1.name.toUpperCase()}</h3>
            <img src={pokemon1.sprites.front_default} alt={pokemon1.name} className="img-fluid pokemon-image" />
            <h5>Tipo: {pokemon1.types.map((type) => type.type.name).join(', ')}</h5>
          </div>
        )}

        {pokemon2 && (
          <div
            className={`col-md-6 text-center ${result?.winner === 'pokemon2' ? 'winner' : 'loser'}`}
          >
            <h3>{pokemon2.name.toUpperCase()}</h3>
            <img src={pokemon2.sprites.front_default} alt={pokemon2.name} className="img-fluid pokemon-image" />
            <h5>Tipo: {pokemon2.types.map((type) => type.type.name).join(', ')}</h5>
          </div>
        )}
      </div>
    </div>
  );
}

export default PokemonComparison;
