import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: 'Ошибка входа',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Успешно',
          description: 'Вы вошли в систему'
        });
      }
    } else {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        toast({
          title: 'Ошибка регистрации',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Успешно',
          description: 'Проверьте email для подтверждения регистрации'
        });
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">
            UNDERGROUND FORUM
          </CardTitle>
          <p className="text-muted-foreground">
            {isLogin ? 'Войти в систему' : 'Создать аккаунт'}
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="displayName" className="text-foreground">
                  Имя пользователя
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Введите имя пользователя"
                  className="bg-input border-border text-foreground"
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите email"
                className="bg-input border-border text-foreground"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-foreground">
                Пароль
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="bg-input border-border text-foreground"
                required
                disabled={loading}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={loading}
            >
              {loading 
                ? (isLogin ? 'Вход...' : 'Регистрация...') 
                : (isLogin ? 'Войти' : 'Зарегистрироваться')
              }
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsLogin(!isLogin)}
              className="text-muted-foreground hover:text-foreground"
              disabled={loading}
            >
              {isLogin 
                ? 'Нет аккаунта? Зарегистрироваться' 
                : 'Уже есть аккаунт? Войти'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}