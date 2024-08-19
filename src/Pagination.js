import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Dropdown, DropdownButton } from 'react-bootstrap';

const Pagination = ({ pokemonsPerPage, totalPokemons, paginate, currentPage }) => {
  const pageNumbers = [];

  // Calcular el número total de páginas
  const totalPages = Math.ceil(totalPokemons / pokemonsPerPage);

  // Agregar todas las páginas al array pageNumbers
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Funciones de paginación
  const handlePrevious = () => {
    if (currentPage > 1) paginate(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) paginate(currentPage + 1);
  };

  // Definir el título del dropdown según la página actual
  const dropdownTitle = currentPage > 1 && currentPage < totalPages ? currentPage : "...";

  return (
    <nav>
      <ul className="pagination justify-content-center">
        {/* Botón para la página anterior */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={handlePrevious}>
            &larr;
          </button>
        </li>

        {/* Botón para la primera página */}
        <li className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
          <button className="page-link" onClick={() => paginate(1)}>
            1
          </button>
        </li>

        {/* Dropdown para seleccionar páginas intermedias */}
        {totalPages > 3 && (
          <li className="page-item">
            <DropdownButton
              title={dropdownTitle}
              variant="outline-primary"
              id="dropdown-pages"
              onSelect={(eventKey) => paginate(Number(eventKey))}
            >
              {pageNumbers.slice(1, totalPages - 1).map((number) => (
                <Dropdown.Item key={number} eventKey={number}>
                  Página {number}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </li>
        )}

        {/* Botón para la última página */}
        {totalPages > 1 && (
          <li className={`page-item ${currentPage === totalPages ? 'active' : ''}`}>
            <button className="page-link" onClick={() => paginate(totalPages)}>
              {totalPages}
            </button>
          </li>
        )}

        {/* Botón para la página siguiente */}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={handleNext}>
            &rarr;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
