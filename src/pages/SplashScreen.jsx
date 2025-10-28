import { Utensils } from 'lucide-react';
import logoImage from '../assets/Logosinletrasabajo-removebg-preview.png'; 

const SplashScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-burgundy-700 to-burgundy-900 flex items-center justify-center">
      <div className="text-center animate-pulse">
        {/* Imagen  */}
        <div className="flex justify-center">
          <img
            src={logoImage}
            alt="Logo Reelish"
            className="w-48 h-auto" 
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
