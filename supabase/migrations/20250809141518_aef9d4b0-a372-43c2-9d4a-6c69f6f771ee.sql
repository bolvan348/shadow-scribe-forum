-- Создаем таблицу пользователей с дополнительными данными
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  display_id INTEGER UNIQUE NOT NULL DEFAULT 999999 + floor(random() * 900000)::integer,
  role TEXT DEFAULT 'user' CHECK (role IN ('owner', 'admin', 'moderator', 'user')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем таблицу категорий форума
CREATE TABLE public.forum_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем таблицу тем форума
CREATE TABLE public.forum_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pinned BOOLEAN DEFAULT FALSE,
  locked BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем таблицу постов в темах
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS для всех таблиц
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- Политики для profiles
CREATE POLICY "Profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Политики для categories (только чтение для всех)
CREATE POLICY "Categories are viewable by everyone" 
  ON public.forum_categories FOR SELECT 
  USING (true);

-- Политики для topics
CREATE POLICY "Topics are viewable by everyone" 
  ON public.forum_topics FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create topics" 
  ON public.forum_topics FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = (SELECT user_id FROM public.profiles WHERE id = author_id));

CREATE POLICY "Authors can update their own topics" 
  ON public.forum_topics FOR UPDATE 
  USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = author_id));

-- Политики для posts
CREATE POLICY "Posts are viewable by everyone" 
  ON public.forum_posts FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create posts" 
  ON public.forum_posts FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = (SELECT user_id FROM public.profiles WHERE id = author_id));

CREATE POLICY "Authors can update their own posts" 
  ON public.forum_posts FOR UPDATE 
  USING (auth.uid() = (SELECT user_id FROM public.profiles WHERE id = author_id));

-- Создаем триггер для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
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

-- Создаем триггер для обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Устанавливаем триггеры
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON public.forum_topics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.forum_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Создаем начальные категории форума
INSERT INTO public.forum_categories (name, description, icon, position) VALUES
('Социальная инженерия', 'Обсуждение методов и техник социальной инженерии', '🎭', 1),
('Безопасность', 'Вопросы информационной безопасности', '🔒', 2),
('Общие вопросы', 'Общие обсуждения и вопросы', '💬', 3),
('Новости', 'Новости в сфере кибербезопасности', '📰', 4);