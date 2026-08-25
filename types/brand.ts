export interface ThemeConfig {
  primary_color: string;
  logo_url: string;
  font_style: string;
  headline: string;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  domain: string;
  vertical: string;
  sub_vertical: string | null;
  theme_config: ThemeConfig;
  form_schema: Record<string, unknown>;
  legal_copy: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
