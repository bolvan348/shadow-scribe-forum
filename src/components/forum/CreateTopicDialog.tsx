import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface CreateTopicDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  onTopicCreated: () => void;
}

export function CreateTopicDialog({ isOpen, onClose, categoryId, onTopicCreated }: CreateTopicDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    if (!profile) {
      toast({
        title: 'Ошибка',
        description: 'Вы должны быть авторизованы',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('forum_topics')
      .insert({
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId,
        author_id: profile.id
      });

    if (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать тему',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Успешно',
        description: 'Тема создана'
      });
      setTitle('');
      setContent('');
      onTopicCreated();
    }

    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Создать новую тему</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-foreground">
              Заголовок темы
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите заголовок темы..."
              className="bg-input border-border text-foreground"
              disabled={loading}
            />
          </div>
          
          <div>
            <Label htmlFor="content" className="text-foreground">
              Содержание
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Опишите вашу тему подробнее..."
              className="bg-input border-border text-foreground min-h-32"
              disabled={loading}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? 'Создание...' : 'Создать тему'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}