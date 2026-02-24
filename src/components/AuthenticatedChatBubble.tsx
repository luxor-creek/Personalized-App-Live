import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AIChatAssistant from "./AIChatAssistant";

/**
 * Only renders the AI chat bubble if the user is authenticated.
 * Placed in App.tsx so it appears on every page.
 */
const AuthenticatedChatBubble = () => {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuth(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuth(!!session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (!isAuth) return null;
  return <AIChatAssistant />;
};

export default AuthenticatedChatBubble;
