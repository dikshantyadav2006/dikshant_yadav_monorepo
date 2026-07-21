import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import EditorialField from './EditorialField';
import EditorialTextarea from './EditorialTextarea';
import EditorialBudgetSelector from './EditorialBudgetSelector';

const validate = (data) => {
  const errors = {};

  if (!data.name.trim()) {
    errors.name = 'REQUIRED';
  }

  if (!data.phone.trim()) {
    errors.phone = 'REQUIRED';
  } else if (!/^[+\d\s()-]{7,20}$/.test(data.phone.trim())) {
    errors.phone = 'INVALID PHONE';
  }

  if (!data.email.trim()) {
    errors.email = 'REQUIRED';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'INVALID EMAIL';
  }

  if (!data.message.trim()) {
    errors.message = 'REQUIRED';
  }

  if (!data.budget) {
    errors.budget = 'SELECT A BUDGET';
  }

  return errors;
};

/**
 * EditorialContactForm Component
 * Premium editorial inquiry experience
 *
 * Ultra-minimal luxury agency aesthetic
 * Typography-first design with large whitespace
 *
 * @param {Object} props
 * @param {string} [props.title] - Form heading
 * @param {string[]} [props.budgets] - Budget options
 * @param {Function} props.onSubmit - Form submit handler
 */
const EditorialContactForm = ({
  title = 'Discuss Your Project',
  budgets = ['5K–10K', '10K–20K', '20K–50K', 'Custom'],
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    budget: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const val = name === 'message' ? value : value.toUpperCase();
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }, [errors]);

  const handleBudgetChange = useCallback((budget) => {
    setFormData((prev) => ({ ...prev, budget }));
    if (errors.budget) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.budget;
        return next;
      });
    }
  }, [errors]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const validationErrors = validate(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit?.(formData);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, isSubmitting, onSubmit]
  );

  return (
    <section
      className="
        h-[90vh]
        max-h-[90vh]
        flex
        items-center
        justify-center
        px-6
      "
    >
      <div style={{ width: 'min(90vw, 640px)' }}>
        {/* Form Heading */}
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: '0px 0px -50px 0px' }}
          className="
            font-['Inter',_sans-serif]
            text-3xl
            sm:text-4xl
            md:text-5xl
            font-medium
            tracking-[-0.03em]
            text-[var(--dark-color)]
            dark:text-[var(--light-color)]
            mb-8
            md:mb-10
            leading-tight
          "
        >
          {title}
        </motion.h3>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-7 md:space-y-8" noValidate>
          <EditorialField
            label="YOUR NAME"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
            error={errors.name}
          />

          <EditorialField
            label="PHONE"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
            error={errors.phone}
          />

          <EditorialField
            label="YOUR EMAIL"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            error={errors.email}
          />

          <EditorialTextarea
            label="MESSAGE"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            height={85}
            error={errors.message}
          />

          <EditorialBudgetSelector
            label="YOUR BUDGET"
            options={budgets}
            value={formData.budget}
            onChange={handleBudgetChange}
            error={errors.budget}
          />

          {/* Submit CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true, margin: '0px 0px -50px 0px' }}
            className="mt-6 md:mt-8"
          >
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                group
                bg-transparent
                border-none
                cursor-target
                cursor-none
                font-['Inter',_sans-serif]
                text-[clamp(22px,2.5vw,34px)]
                font-medium
                tracking-[-0.03em]
                text-[var(--dark-color)]
                dark:text-[var(--light-color)]
                transition-colors
                duration-300
                ease-out
                hover:opacity-70
                disabled:opacity-40
                disabled:cursor-not-allowed
                text-left
                w-full
                py-3
                flex
                items-center
                gap-3
              "
            >
              <span>{isSubmitting ? 'SENDING...' : 'DISCUSS THE PROJECT'}</span>
              <span
                className="
                  inline-block
                  transition-transform
                  duration-300
                  ease-out
                  group-hover:translate-x-1
                  group-hover:-translate-y-1
                "
              >
                ↗
              </span>
            </button>
          </motion.div>
        </form>
      </div>
    </section>
  );
};

export default EditorialContactForm;
