import { motion } from 'framer-motion';

/**
 * EditorialField Component
 * Minimal input field with single bottom border
 * Monospace label, clean sans-serif input, uppercase text
 *
 * @param {Object} props
 * @param {string} props.label - Field label (displayed uppercase)
 * @param {string} props.name - Input name attribute
 * @param {string} props.type - Input type (default: 'text')
 * @param {string} props.value - Controlled value
 * @param {Function} props.onChange - Change handler
 * @param {string} [props.placeholder] - Optional placeholder
 * @param {boolean} [props.required] - Required field
 * @param {string} [props.autoComplete] - Autocomplete hint
 * @param {string} [props.error] - Validation error message
 * @param {boolean} [props.disabled] - Disabled state
 */
const EditorialField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  error,
  disabled = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      viewport={{ once: true, margin: '0px 0px -50px 0px' }}
    >
      <label
        htmlFor={name}
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
          mb-1
        "
      >
        {label}
        {required && <span className="ml-1">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        className="
          w-full
          bg-transparent
          border-0
          border-b
          border-b-gray-500
          dark:border-b-white/30
          py-0.5
          md:py-0.5
          font-['Inter',_sans-serif]
          text-[15px]
          md:text-base
          font-normal
          text-[var(--dark-color)]
          dark:text-[var(--light-color)]
          placeholder:opacity-0
          focus:outline-none
          focus:border-b-[var(--dark-color)]
          dark:focus:border-b-[var(--light-color)]
          transition-colors
          duration-300
          ease-out
          cursor-target
          appearance-none
          rounded-none
          cursor-none
          uppercase
          tracking-wide
          disabled:opacity-40
          disabled:cursor-not-allowed
        "
        style={{ borderBottomWidth: '0.5px' }}
      />

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

export default EditorialField;
