-- Add about_content field to store the about section body text
ALTER TABLE public.landing_page_templates 
ADD COLUMN IF NOT EXISTS about_content text;

-- Add image URL fields for editable images
ALTER TABLE public.landing_page_templates 
ADD COLUMN IF NOT EXISTS client_logos_url text,
ADD COLUMN IF NOT EXISTS portfolio_strip_url text;