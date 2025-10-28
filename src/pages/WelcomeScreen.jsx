import { useNavigate } from 'react-router-dom';
import burgerImage from '../assets/hamburguers.png';


const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Imagen principal */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div className="relative">
          <img
            src={burgerImage}
            alt="Burger"
            className="w-full max-w-md object-cover"
          />
          {/* Efecto de manos */}
          <div className="absolute inset-0 bg-gradient-to-t from-burgundy-900/60 to-transparent"></div>
        </div>
      </div>

      {/* Sección inferior */}
      <div className="bg-gradient-to-t from-burgundy-800 to-burgundy-900 p-8 pb-12 rounded-t-3xl">
        <h2 className="text-3xl font-bold text-gold mb-2 text-center">
          DONDE LA FICCIÓN
        </h2>
        <p className="text-xl text-white text-center mb-2">
          SE CONVIERTE EN
        </p>
        <h3 className="text-4xl font-bold text-gold mb-8 text-center">
          SABOR
        </h3>

        <button
          onClick={() => navigate('/home')}
          className="w-full bg-gold hover:bg-gold-dark text-white-900 font-italic py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          INICIAR SESIÓN
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;