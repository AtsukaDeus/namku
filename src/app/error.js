'use client';

export default function Error({
  error,
  reset,
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-2xl font-bold mb-4">¡Algo salió mal!</h2>
      <p className="text-gray-600 mb-4">
        Ha ocurrido un error inesperado.
      </p>
      <button
        onClick={reset}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}