import { motion } from 'framer-motion';

/**
 * EditorialBudgetSelector Component
 * Text-only budget selection - no pills, no buttons
 * Active state uses bold weight, inactive reduced opacity
 *
 * @param {Object} props
 * @param {string} props.label - Section label
 * @param {string[]} props.options - Budget option labels
 * @param {string} props.value - Currently selected value
 * @param {Function} props.onChange - Selection handler
 */
const EditorialBudgetSelector = ({
  label = 'YOUR BUDGET',
  options = ['5K–10K', '10K–20K', '20K–50K', 'Custom'],
  value,
  onChange,
  error,
  disabled = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      viewport={{ once: true, margin: '0px 0px -50px 0px' }}
      className="space-y-0.5"
    >
      <span
        className="
          block
          font-['IBM_Plex_Mono',_monospace]
          text-[10px]
          md:text-xs
          font-normal
          uppercase
          tracking-[0.08em]
          text-[var(--dark-color)]
          dark:text-[var(--light-color)]
          opacity-60
        "
      >
        {label}
      </span>

      <div className="flex flex-wrap gap-x-6 gap-y-1">
        {options.map((option) => {
          const isSelected = value === option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              disabled={disabled}
              className={`
                bg-transparent
                border-none
                cursor-target
                cursor-none
                font-['Inter',_sans-serif]
                text-xs
                md:text-sm
                uppercase
                tracking-wide
                transition-all
                duration-300
                ease-out
                py-0.5
                disabled:opacity-30
                disabled:cursor-not-allowed
                ${
                  isSelected
                    ? 'font-semibold text-[var(--dark-color)] dark:text-[var(--light-color)] opacity-100'
                    : 'font-normal text-[var(--dark-color)] dark:text-[var(--light-color)] opacity-50 hover:opacity-80'
                }
              `}
            >
              {option}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="
          mt-1
          font-['IBM_Plex_Mono',_monospace]
          text-[9px]
          md:text-[10px]
          text-red-500
          dark:text-red-400
          tracking-wide
        ">
          {error}
        </p>
      )}
    </motion.div>
  );
};

export default EditorialBudgetSelector;
