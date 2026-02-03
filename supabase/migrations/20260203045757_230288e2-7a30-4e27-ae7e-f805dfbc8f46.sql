-- Create campaigns table
CREATE TABLE public.campaigns (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create personalized_pages table
CREATE TABLE public.personalized_pages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    first_name TEXT NOT NULL,
    last_name TEXT,
    company TEXT,
    custom_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create page_views table for analytics
CREATE TABLE public.page_views (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    personalized_page_id UUID NOT NULL REFERENCES public.personalized_pages(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    user_agent TEXT,
    ip_address TEXT
);

-- Create index for faster token lookups
CREATE INDEX idx_personalized_pages_token ON public.personalized_pages(token);
CREATE INDEX idx_personalized_pages_campaign ON public.personalized_pages(campaign_id);
CREATE INDEX idx_page_views_page_id ON public.page_views(personalized_page_id);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if user owns campaign
CREATE OR REPLACE FUNCTION public.user_owns_campaign(_campaign_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.campaigns
        WHERE id = _campaign_id AND user_id = auth.uid()
    )
$$;

-- Helper function: Check if user owns the campaign for a personalized page
CREATE OR REPLACE FUNCTION public.user_owns_personalized_page(_page_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.personalized_pages pp
        JOIN public.campaigns c ON c.id = pp.campaign_id
        WHERE pp.id = _page_id AND c.user_id = auth.uid()
    )
$$;

-- RLS Policies for campaigns
CREATE POLICY "Users can create their own campaigns"
ON public.campaigns FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own campaigns"
ON public.campaigns FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
ON public.campaigns FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
ON public.campaigns FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for personalized_pages
CREATE POLICY "Anyone can view personalized pages by token"
ON public.personalized_pages FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create pages for their campaigns"
ON public.personalized_pages FOR INSERT
TO authenticated
WITH CHECK (public.user_owns_campaign(campaign_id));

CREATE POLICY "Users can update pages for their campaigns"
ON public.personalized_pages FOR UPDATE
TO authenticated
USING (public.user_owns_campaign(campaign_id));

CREATE POLICY "Users can delete pages for their campaigns"
ON public.personalized_pages FOR DELETE
TO authenticated
USING (public.user_owns_campaign(campaign_id));

-- RLS Policies for page_views
CREATE POLICY "Anyone can insert page views"
ON public.page_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Campaign owners can view their page analytics"
ON public.page_views FOR SELECT
TO authenticated
USING (public.user_owns_personalized_page(personalized_page_id));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();