CREATE OR REPLACE FUNCTION public.decrement_user_credits(p_user_id UUID)
RETURNS TABLE(success BOOLEAN, remaining_credits INTEGER) AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  SELECT credits INTO current_credits
  FROM public.profiles
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  IF current_credits IS NULL OR current_credits <= 0 THEN
    RETURN QUERY SELECT FALSE, COALESCE(current_credits, 0);
    RETURN;
  END IF;
  
  UPDATE public.profiles
  SET credits = credits - 1
  WHERE user_id = p_user_id;
  
  RETURN QUERY SELECT TRUE, current_credits - 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;