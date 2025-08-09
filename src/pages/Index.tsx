import { useAuth } from '@/hooks/useAuth';
import { ForumHeader } from '@/components/forum/ForumHeader';
import { ForumCategories } from '@/components/forum/ForumCategories';
import { AuthPage } from '@/components/auth/AuthPage';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <ForumHeader />
      <main className="max-w-7xl mx-auto p-6">
        <ForumCategories />
      </main>
    </div>
  );
};

export default Index;
