-- Исправляем проблему с search_path для функции handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Для первого пользователя устанавливаем ID = 1 и роль owner
  IF NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) THEN
    INSERT INTO public.profiles (user_id, display_name, display_id, role)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'Admin'), 1, 'owner');
  ELSE
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'User'));
  END IF;
  RETURN NEW;
END;
$$;