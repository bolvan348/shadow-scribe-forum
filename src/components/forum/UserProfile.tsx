import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserProfile as UserProfileType } from '@/hooks/useAuth';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfileType | null;
}

export function UserProfile({ isOpen, onClose, profile }: UserProfileProps) {
  if (!profile) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-red-600 text-white';
      case 'admin':
        return 'bg-orange-600 text-white';
      case 'moderator':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-muted text-muted-foreground';
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
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Профиль пользователя</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-muted text-foreground text-lg">
                {profile.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {profile.display_name || 'Пользователь'}
              </h3>
              <p className="text-muted-foreground">ID: {profile.display_id}</p>
              <Badge className={getRoleColor(profile.role)}>
                {getRoleText(profile.role)}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Дата регистрации:
              </label>
              <p className="text-foreground">
                {new Date(profile.created_at).toLocaleDateString('ru-RU')}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Последнее обновление:
              </label>
              <p className="text-foreground">
                {new Date(profile.updated_at).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}