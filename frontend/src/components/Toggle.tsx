import { forwardRef } from 'react';

interface ToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  ({ label, checked, onChange }, ref) => {
    return (
      <div className="flex items-center gap-4">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <button
          type="button"
          ref={ref}
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors duration-200 ease-in-out
            ${checked ? 'bg-blue-600' : 'bg-gray-200'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white
              transition-transform duration-200 ease-in-out
              ${checked ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    );
  }
);

Toggle.displayName = 'Toggle'; 
