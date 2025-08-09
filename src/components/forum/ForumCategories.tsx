import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CreateTopicDialog } from './CreateTopicDialog';
import { MessageSquare, Pin, Lock, Eye } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  position: number;
}

interface Topic {
  id: string;
  title: string;
  content: string;
  category_id: string;
  author_id: string;
  pinned: boolean;
  locked: boolean;
  views: number;
  created_at: string;
  updated_at: string;
  profiles: {
    display_name: string;
    display_id: number;
    role: string;
  };
  forum_posts: { count: number }[];
}

export function ForumCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadTopics(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .order('position');

    if (!error && data) {
      setCategories(data);
    }
  };

  const loadTopics = async (categoryId: string) => {
    const { data, error } = await supabase
      .from('forum_topics')
      .select(`
        *,
        profiles(display_name, display_id, role),
        forum_posts(count)
      `)
      .eq('category_id', categoryId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTopics(data as any);
    }
  };

  const handleTopicCreated = () => {
    if (selectedCategory) {
      loadTopics(selectedCategory);
    }
    setShowCreateTopic(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (selectedCategory) {
    const category = categories.find(c => c.id === selectedCategory);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedCategory(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Назад к категориям
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center space-x-2">
                <span>{category?.icon}</span>
                <span>{category?.name}</span>
              </h2>
              <p className="text-muted-foreground">{category?.description}</p>
            </div>
          </div>
          
          {user && (
            <Button
              onClick={() => setShowCreateTopic(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Создать тему
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {topics.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Пока нет тем
                </h3>
                <p className="text-muted-foreground mb-4">
                  Станьте первым, кто создаст тему в этой категории
                </p>
                {user && (
                  <Button
                    onClick={() => setShowCreateTopic(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Создать первую тему
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            topics.map((topic) => (
              <Card key={topic.id} className="bg-card border-border hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {topic.pinned && <Pin className="w-4 h-4 text-yellow-500" />}
                        {topic.locked && <Lock className="w-4 h-4 text-red-500" />}
                        <h3 className="font-semibold text-foreground text-lg">
                          {topic.title}
                        </h3>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {topic.content}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>
                          Автор: <span className="font-medium">{topic.profiles.display_name}</span> (ID: {topic.profiles.display_id})
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{topic.views}</span>
                        </span>
                        <span>
                          {formatDate(topic.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {showCreateTopic && selectedCategory && (
          <CreateTopicDialog
            isOpen={showCreateTopic}
            onClose={() => setShowCreateTopic(false)}
            categoryId={selectedCategory}
            onTopicCreated={handleTopicCreated}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">ФОРУМ</h2>
        <p className="text-muted-foreground">Выберите раздел для обсуждения</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => setSelectedCategory(category.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-foreground">
                <span className="text-2xl">{category.icon}</span>
                <span>{category.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{category.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>Темы: 0</span>
                <span>Сообщения: 0</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}