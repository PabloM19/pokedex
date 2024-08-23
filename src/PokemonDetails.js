import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function PokemonDetails() {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [evolution, setEvolution] = useState(null);
  const [typeRelations, setTypeRelations] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    const getPokemonDetails = async () => {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await response.json();

      const translatedData = {
        ...data,
        name: data.species.names?.find((name) => name.language.name === 'es')?.name || data.name,
        abilities: await Promise.all(data.abilities.map(async (ability) => {
          const abilityResponse = await fetch(ability.ability.url);
          const abilityData = await abilityResponse.json();
          return {
            ...ability,
            ability: {
              ...ability.ability,
              name: abilityData.names.find((name) => name.language.name === 'es')?.name || ability.ability.name,
            },
          };
        })),
        types: await Promise.all(data.types.map(async (type) => {
          const typeResponse = await fetch(type.type.url);
          const typeData = await typeResponse.json();
          return {
            ...type,
            type: {
              ...type.type,
              name: typeData.names.find((name) => name.language.name === 'es')?.name || type.type.name,
            },
          };
        })),
        moves: await Promise.all(data.moves.slice(0, 10).map(async (move) => {
          const moveResponse = await fetch(move.move.url);
          const moveData = await moveResponse.json();
          return {
            ...move,
            move: {
              ...move.move,
              name: moveData.names.find((name) => name.language.name === 'es')?.name || move.move.name,
            },
          };
        })),
      };

      setPokemon(translatedData);

      const speciesResponse = await fetch(data.species.url);
      const speciesData = await speciesResponse.json();
      const evolutionChainResponse = await fetch(speciesData.evolution_chain.url);
      const evolutionChainData = await evolutionChainResponse.json();
      const evolutionDetails = getEvolutionStage(evolutionChainData.chain, translatedData.name);
      setEvolution(evolutionDetails);

      const types = translatedData.types.map(type => fetch(type.type.url).then(res => res.json()));
      const typeData = await Promise.all(types);

      const relations = calculateTypeRelations(typeData);
      setTypeRelations(relations);
    };

    getPokemonDetails();
  }, [id]);

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

  const calculateTypeRelations = (typeData) => {
    const relations = {
      doubleDamageFrom: new Set(),
      halfDamageFrom: new Set(),
      noDamageFrom: new Set(),
      doubleDamageTo: new Set(),
      halfDamageTo: new Set(),
      noDamageTo: new Set()
    };

    typeData.forEach(type => {
      type.damage_relations.double_damage_from.forEach(damage => relations.doubleDamageFrom.add(damage.names?.find((name) => name.language.name === 'es')?.name || damage.name));
      type.damage_relations.half_damage_from.forEach(damage => relations.halfDamageFrom.add(damage.names?.find((name) => name.language.name === 'es')?.name || damage.name));
      type.damage_relations.no_damage_from.forEach(damage => relations.noDamageFrom.add(damage.names?.find((name) => name.language.name === 'es')?.name || damage.name));
      type.damage_relations.double_damage_to.forEach(damage => relations.doubleDamageTo.add(damage.names?.find((name) => name.language.name === 'es')?.name || damage.name));
      type.damage_relations.half_damage_to.forEach(damage => relations.halfDamageTo.add(damage.names?.find((name) => name.language.name === 'es')?.name || damage.name));
      type.damage_relations.no_damage_to.forEach(damage => relations.noDamageTo.add(damage.names?.find((name) => name.language.name === 'es')?.name || damage.name));
    });

    return {
      doubleDamageFrom: Array.from(relations.doubleDamageFrom),
      halfDamageFrom: Array.from(relations.halfDamageFrom),
      noDamageFrom: Array.from(relations.noDamageFrom),
      doubleDamageTo: Array.from(relations.doubleDamageTo),
      halfDamageTo: Array.from(relations.halfDamageTo),
      noDamageTo: Array.from(relations.noDamageTo),
    };
  };

  if (!pokemon || !evolution || !typeRelations) {
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
            style={{height:"200px"}}
          />

          {/* Tabs para cambiar la vista */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
              >
                Estadísticas
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'abilities' ? 'active' : ''}`}
                onClick={() => setActiveTab('abilities')}
              >
                Habilidades
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'evolution' ? 'active' : ''}`}
                onClick={() => setActiveTab('evolution')}
              >
                Evolución
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'relations' ? 'active' : ''}`}
                onClick={() => setActiveTab('relations')}
              >
                Relaciones de Tipo
              </button>
            </li>
          </ul>

          {/* Contenido de las Tabs */}
          <div className="tab-content">
            {activeTab === 'stats' && (
              <div className="tab-pane active">
                <h4 className="text-center">Estadísticas</h4>
                <ul className="list-group mb-4">
                  {pokemon.stats.map((stat) => (
                    <li key={stat.stat.name} className="list-group-item">
                      <div className="stat-desc">{stat.stat.name.toUpperCase()}</div>
                      <div className="stat-number">{stat.base_stat}</div>
                      <div className="stat-bar">
                        <div className="bar-outer">
                          <div
                            className="bar-inner"
                            style={{
                              width: `${stat.base_stat}%`,
                              backgroundColor: stat.base_stat > 50 ? 'green' : 'red',
                            }}
                          ></div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'abilities' && (
              <div className="tab-pane active">
                <h4 className="text-center">Habilidades</h4>
                <ul className="list-group mb-4">
                  {pokemon.abilities.map((ability) => (
                    <li key={ability.ability.name} className="list-group-item">
                      {ability.ability.name.toUpperCase()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'evolution' && (
              <div className="tab-pane active">
                <h4 className="text-center">Cadena de Evolución</h4>
                <p>Fase actual: {evolution.stage}</p>
                {evolution.evolutions.length > 0 ? (
                  <ul className="list-group mb-4">
                    {evolution.evolutions.map((evolutionName) => (
                      <li key={evolutionName} className="list-group-item">
                        {evolutionName.toUpperCase()}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Este Pokémon no tiene evoluciones.</p>
                )}
              </div>
            )}

            {activeTab === 'relations' && (
              <div className="tab-pane active">
                <h4 className="text-center">Relaciones de Tipo</h4>
                <div className="relation-section">
                  <h5>Daño Doble De:</h5>
                  <ul>
                    {typeRelations.doubleDamageFrom.map((type) => (
                      <li key={type}>{type.toUpperCase()}</li>
                    ))}
                  </ul>
                </div>

                <div className="relation-section">
                  <h5>Daño Mitad De:</h5>
                  <ul>
                    {typeRelations.halfDamageFrom.map((type) => (
                      <li key={type}>{type.toUpperCase()}</li>
                    ))}
                  </ul>
                </div>

                <div className="relation-section">
                  <h5>Daño Doble A:</h5>
                  <ul>
                    {typeRelations.doubleDamageTo.map((type) => (
                      <li key={type}>{type.toUpperCase()}</li>
                    ))}
                  </ul>
                </div>

                <div className="relation-section">
                  <h5>Daño Mitad A:</h5>
                  <ul>
                    {typeRelations.halfDamageTo.map((type) => (
                      <li key={type}>{type.toUpperCase()}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetails;
