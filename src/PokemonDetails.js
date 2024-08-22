import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function PokemonDetails() {
  const { id } = useParams(); // Obtenemos el ID del Pokémon desde la URL
  const [pokemon, setPokemon] = useState(null);
  const [evolution, setEvolution] = useState(null); // Estado para la información evolutiva
  const [typeRelations, setTypeRelations] = useState(null); // Estado para relaciones de tipo

  useEffect(() => {
    // Función para obtener detalles del Pokémon
    const getPokemonDetails = async () => {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await response.json();

      

      // Traducir nombres al español
      const translatedData = {
        ...data,
        name: data.species.names?.find((name) => name.language.name === 'en')?.name || data.name,
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
        moves: await Promise.all(data.moves.slice(0, 10).map(async (move) => { // Limitamos los movimientos mostrados
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

      // Obtener detalles de la especie para acceder a la cadena evolutiva
      const speciesResponse = await fetch(data.species.url);
      const speciesData = await speciesResponse.json();

      // Obtener la URL de la cadena evolutiva y luego la cadena evolutiva
      const evolutionChainResponse = await fetch(speciesData.evolution_chain.url);
      const evolutionChainData = await evolutionChainResponse.json();

      // Determinar la etapa evolutiva del Pokémon actual
      const evolutionDetails = getEvolutionStage(evolutionChainData.chain, translatedData.name);
      setEvolution(evolutionDetails);

      // Obtener relaciones de tipo
      const types = translatedData.types.map(type => fetch(type.type.url).then(res => res.json()));
      const typeData = await Promise.all(types);

      const relations = calculateTypeRelations(typeData);
      setTypeRelations(relations);
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

  // Función para calcular las relaciones de tipo (debilidades, fortalezas, inmunidades)
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

    // Convertir Sets a Arrays
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

          {/* Relación de tipos */}
          <h4 className="text-center">Relaciones de Tipo</h4>
          <ul className="list-group mb-4">
            <li className="list-group-item">
              Débil contra: {typeRelations.doubleDamageFrom.length > 0 ? typeRelations.doubleDamageFrom.join(', ') : 'Ninguno'}
            </li>
            <li className="list-group-item">
              Resistente contra: {typeRelations.halfDamageFrom.length > 0 ? typeRelations.halfDamageFrom.join(', ') : 'Ninguno'}
            </li>
            <li className="list-group-item">
              Inmune contra: {typeRelations.noDamageFrom.length > 0 ? typeRelations.noDamageFrom.join(', ') : 'Ninguno'}
            </li>
            <li className="list-group-item">
              Fuerte contra: {typeRelations.doubleDamageTo.length > 0 ? typeRelations.doubleDamageTo.join(', ') : 'Ninguno'}
            </li>
            <li className="list-group-item">
              Poco efectivo contra: {typeRelations.halfDamageTo.length > 0 ? typeRelations.halfDamageTo.join(', ') : 'Ninguno'}
            </li>
            <li className="list-group-item">
              Ineficaz contra: {typeRelations.noDamageTo.length > 0 ? typeRelations.noDamageTo.join(', ') : 'Ninguno'}
            </li>
          </ul>

          {/* Evolución */}
          <h4 className="text-center">Evolución</h4>
          <ul className="list-group mb-4">
            <li className="list-group-item">Etapa: {evolution.stage}</li>
            <li className="list-group-item">Evoluciones: {evolution.evolutions.length > 0 ? evolution.evolutions.join(', ') : 'Ninguna'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetails;
