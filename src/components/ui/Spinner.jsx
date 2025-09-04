import React from 'react';

// Este é um componente simples que renderiza uma div.
// As classes do Tailwind CSS cuidam de criar a animação de rotação.
const Spinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
);

export default Spinner;

