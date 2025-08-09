import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить пользователей',
        variant: 'destructive'
      });
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить роль пользователя',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Успешно',
        description: 'Роль пользователя обновлена'
      });
      loadUsers();
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Владелец';
      case 'admin':
        return 'Администратор';
      case 'moderator':
        return 'Модератор';
      default:
        return 'Пользователь';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Панель администратора</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Управление пользователями</h3>
          
          {loading ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-muted rounded border"
                >
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {user.display_name || 'Пользователь'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ID: {user.display_id} • {getRoleText(user.role)}
                      </p>
                    </div>
                  </div>
                  
                  {user.role !== 'owner' && (
                    <Select
                      value={user.role}
                      onValueChange={(value) => updateUserRole(user.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Пользователь</SelectItem>
                        <SelectItem value="moderator">Модератор</SelectItem>
                        <SelectItem value="admin">Администратор</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}