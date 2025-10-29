import { CheckCircle, XCircle } from 'lucide-react';

const PasswordValidator = ({ password, showValidation = true }) => {
  const validations = [
    {
      label: 'Al menos 8 caracteres',
      valid: password.length >= 8,
    },
    {
      label: 'Una letra mayúscula',
      valid: /[A-Z]/.test(password),
    },
    {
      label: 'Una letra minúscula',
      valid: /[a-z]/.test(password),
    },
    {
      label: 'Un número',
      valid: /[0-9]/.test(password),
    },
    {
      label: 'Un carácter especial (!@#$%^&*)',
      valid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  const allValid = validations.every(v => v.valid);

  if (!showValidation || !password) return null;

  return (
    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <p className="text-xs font-medium text-gray-700 mb-2">
        Tu contraseña debe contener:
      </p>
      <ul className="space-y-1">
        {validations.map((validation, index) => (
          <li key={index} className="flex items-center gap-2 text-xs">
            {validation.valid ? (
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <span className={validation.valid ? 'text-green-700' : 'text-gray-600'}>
              {validation.label}
            </span>
          </li>
        ))}
      </ul>
      {allValid && (
        <div className="mt-2 pt-2 border-t border-gray-300">
          <p className="text-xs font-semibold text-green-700 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            ¡Contraseña segura!
          </p>
        </div>
      )}
    </div>
  );
};

// Función de utilidad para validar contraseña
export const validatePassword = (password) => {
  const validations = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isValid = Object.values(validations).every(v => v);

  return {
    isValid,
    validations,
    message: isValid 
      ? 'Contraseña segura' 
      : 'La contraseña no cumple con los requisitos de seguridad',
  };
};

export default PasswordValidator;