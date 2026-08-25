export interface ComponentConfig {
  name?: string;
  description?: string;
  props?: Record<string, string>;
  category?: string;
  author?: string;
}

export function parseConfig(code: string): ComponentConfig | null {
  const configMatch = code.match(/export\s+const\s+config\s*=\s*(\{[\s\S]*?\n\};?)/);
  if (!configMatch) return null;

  try {
    const raw = configMatch[1].replace(/};?\s*$/, '}');
    const configObj = new Function(`return (${raw})`)();
    return configObj as ComponentConfig;
  } catch {
    return null;
  }
}

export function getDefaultProps(config: ComponentConfig | null): Record<string, any> {
  if (!config?.props) return {};

  const defaults: Record<string, any> = {};
  for (const [key, type] of Object.entries(config.props)) {
    switch (type) {
      case 'string':
        defaults[key] = '';
        break;
      case 'number':
        defaults[key] = 0;
        break;
      case 'boolean':
        defaults[key] = false;
        break;
      case 'string[]':
        defaults[key] = [];
        break;
      default:
        defaults[key] = '';
    }
  }
  return defaults;
}
