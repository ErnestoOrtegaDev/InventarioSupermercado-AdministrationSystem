// src/App.tsx
function App() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl text-center">
        <h1 className="text-4xl font-bold text-blue-500 mb-4">
          ¡Hola Mundo! 🚀
        </h1>
        <p className="text-gray-300 text-lg">
          Frontend conectado con Tailwind CSS.
        </p>
        <button className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
          Click me
        </button>
      </div>
    </div>
  )
}

export default App