import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/components/forum/UserProfile';
import { AdminPanel } from '@/components/forum/AdminPanel';
import { LogOut, User, Settings } from 'lucide-react';

export function ForumHeader() {
  const { user, profile, signOut } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const isOwner = profile?.role === 'owner';

  return (
    <header className="bg-card border-b border-border p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-foreground">UNDERGROUND FORUM</h1>
          <div className="text-sm text-muted-foreground">
            Social Engineering Community
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user && profile && (
            <>
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdminPanel(true)}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Панель
                </Button>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">ID: {profile.display_id}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProfile(true)}
                  className="flex items-center space-x-2"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-muted text-foreground text-xs">
                      {profile.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground">{profile.display_name || 'User'}</span>
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {showProfile && (
        <UserProfile
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          profile={profile}
        />
      )}

      {showAdminPanel && isOwner && (
        <AdminPanel
          isOpen={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
        />
      )}
    </header>
  );
}