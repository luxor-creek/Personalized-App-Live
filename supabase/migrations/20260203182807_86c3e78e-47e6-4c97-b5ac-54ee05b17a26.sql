-- Add new editable fields for the purple CTA section and the form info section
ALTER TABLE public.landing_page_templates
ADD COLUMN IF NOT EXISTS cta_banner_title TEXT,
ADD COLUMN IF NOT EXISTS cta_banner_subtitle TEXT,
ADD COLUMN IF NOT EXISTS form_section_title TEXT,
ADD COLUMN IF NOT EXISTS form_section_subtitle TEXT;