-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can create pages for their campaigns" ON public.personalized_pages;
DROP POLICY IF EXISTS "Users can update pages for their campaigns" ON public.personalized_pages;
DROP POLICY IF EXISTS "Users can delete pages for their campaigns" ON public.personalized_pages;

-- Create permissive policies for password-protected admin
-- Note: Security is enforced at app level with password protection
CREATE POLICY "Allow all campaign operations"
ON public.campaigns FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow insert personalized pages"
ON public.personalized_pages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow update personalized pages"
ON public.personalized_pages FOR UPDATE
USING (true);

CREATE POLICY "Allow delete personalized pages"
ON public.personalized_pages FOR DELETE
USING (true);

-- Update page_views policy to allow viewing all
DROP POLICY IF EXISTS "Campaign owners can view their page analytics" ON public.page_views;
CREATE POLICY "Allow viewing page analytics"
ON public.page_views FOR SELECT
USING (true);