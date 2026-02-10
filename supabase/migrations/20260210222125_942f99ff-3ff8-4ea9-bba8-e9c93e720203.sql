
-- Table to track video play clicks on personalized pages
CREATE TABLE public.video_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  personalized_page_id UUID NOT NULL REFERENCES public.personalized_pages(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.video_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (visitors are anonymous)
CREATE POLICY "Video clicks for valid pages only"
ON public.video_clicks
FOR INSERT
WITH CHECK (
  personalized_page_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.personalized_pages pp WHERE pp.id = personalized_page_id)
  AND (user_agent IS NULL OR length(user_agent) <= 500)
);

-- Campaign owners can view clicks
CREATE POLICY "Campaign owners can view video clicks"
ON public.video_clicks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM personalized_pages pp
    JOIN campaigns c ON c.id = pp.campaign_id
    WHERE pp.id = video_clicks.personalized_page_id AND c.user_id = auth.uid()
  )
);

-- Admins can view all
CREATE POLICY "Admins can view all video clicks"
ON public.video_clicks
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Index for performance
CREATE INDEX idx_video_clicks_page_id ON public.video_clicks(personalized_page_id);
