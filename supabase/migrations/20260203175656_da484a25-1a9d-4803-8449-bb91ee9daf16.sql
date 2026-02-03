-- Add template_id column to campaigns table so we can associate a landing page template with a campaign
ALTER TABLE public.campaigns ADD COLUMN template_id uuid REFERENCES public.landing_page_templates(id);

-- Update existing campaigns to use the wine-video template as default
UPDATE public.campaigns SET template_id = (SELECT id FROM public.landing_page_templates WHERE slug = 'wine-video' LIMIT 1);