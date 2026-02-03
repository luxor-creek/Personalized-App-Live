-- Add new columns for the comparison section content
ALTER TABLE public.landing_page_templates
ADD COLUMN IF NOT EXISTS comparison_problem_title text DEFAULT 'Why Viaxo Exists',
ADD COLUMN IF NOT EXISTS comparison_problem_items jsonb DEFAULT '["Traditional video production doesn''t scale", "Static pages underperform in engagement", "Search and AI discovery prioritize video"]'::jsonb,
ADD COLUMN IF NOT EXISTS comparison_solution_title text DEFAULT 'Infrastructure for Practical Video at Scale',
ADD COLUMN IF NOT EXISTS comparison_solution_description text DEFAULT 'Viaxo provides infrastructure that makes video practical across entire catalogs and campaigns.',
ADD COLUMN IF NOT EXISTS comparison_solution_items jsonb DEFAULT '["Automated generation from existing content", "Template-driven consistency", "Bulk processing capability", "White-label delivery"]'::jsonb;