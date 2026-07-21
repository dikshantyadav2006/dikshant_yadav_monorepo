import { motion } from 'framer-motion';

/**
 * EditorialTextarea Component
 * Minimal textarea with single bottom border
 * Monospace label, clean sans-serif body
 *
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.name - Textarea name attribute
 * @param {string} props.value - Controlled value
 * @param {Function} props.onChange - Change handler
 * @param {number} [props.rows] - Number of rows (default: 4)
 * @param {number} [props.height] - Fixed height in px (optional)
 * @param {string} [props.placeholder] - Optional placeholder
 */
const EditorialTextarea = ({
  label,
  name,
  value,
  onChange,
  rows = 4,
  height,
  placeholder,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      viewport={{ once: true, margin: '0px 0px -50px 0px' }}
      className="space-y-0.5"
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
        "
      >
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        style={height ? { height: `${height}px` } : undefined}
        className="
          w-full
          bg-transparent
          border-0
          border-b
          border-b-gray-300
          dark:border-b-white/15
          py-2
          md:py-0.5
          font-['Inter',_sans-serif]
          text-base
          md:text-lg
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
          resize-none
          cursor-target
          appearance-none
          rounded-none
          cursor-none
        "
      />
    </motion.div>
  );
};

export default EditorialTextarea;
