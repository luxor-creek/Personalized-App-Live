-- Drop the existing overly permissive INSERT policy
DROP POLICY IF EXISTS "Validated page views insert" ON public.page_views;

-- Create a stricter INSERT policy that only allows inserts from anon/authenticated
-- and validates the personalized_page_id exists
CREATE POLICY "Validated page views insert"
ON public.page_views
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.personalized_pages pp
    WHERE pp.id = page_views.personalized_page_id
  )
  AND ip_address IS NOT NULL
  AND user_agent IS NOT NULL
);