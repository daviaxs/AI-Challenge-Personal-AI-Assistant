interface UserAvatarProps {
  user: any;
  size?: number;
  className?: string;
}

export function UserAvatar({ user, size = 40, className = '' }: UserAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2); // Máximo 2 letras
  };

  const getAvatarUrl = (avatarPath: string | null | undefined) => {
    if (!avatarPath) {
      return null;
    }
    
    // Se já é uma URL completa, retorna como está
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    
    // URL do Supabase Storage
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co') {
      return `${supabaseUrl}/storage/v1/object/public/avatar/${avatarPath}`;
    }
    
    // Fallback: se não há URL configurada, retorna null para mostrar iniciais
    if (avatarPath.includes('/') && avatarPath.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/)) {
      console.warn('VITE_SUPABASE_URL not configured. Please add it to your .env file.');
      console.warn('Example: VITE_SUPABASE_URL=https://your-project.supabase.co');
      return null;
    }
    
    return avatarPath;
  };

  const sizeClasses = {
    16: 'w-4 h-4 text-xs',
    36: 'w-9 h-9 text-sm',
    40: 'w-10 h-10 text-sm',
    48: 'w-12 h-12 text-base',
    60: 'w-16 h-16 text-base',
    80: 'w-20 h-20 text-lg',
    100: 'w-24 h-24 text-xl'
  };

  const sizeClass = sizeClasses[size as keyof typeof sizeClasses] || 'w-10 h-10 text-sm';

  const avatarUrl = getAvatarUrl(user?.avatar);

  if (avatarUrl) {
    return (
      <div className="relative">
        <img 
          src={avatarUrl} 
          alt="Avatar" 
          width={size} 
          height={size} 
          className={`rounded-full ${sizeClass} border border-zinc-200 dark:border-zinc-600 object-cover ${className}`}
          onError={(e) => {
            // Fallback se a imagem falhar ao carregar
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) {
              fallback.style.display = 'flex';
            }
          }}
        />
        {/* Fallback invisível que aparece quando a imagem falha */}
        <div 
          className={`rounded-full ${sizeClass} border border-zinc-200 dark:border-zinc-600 flex items-center justify-center font-medium bg-zinc-200 text-zinc-700 dark:bg-zinc-600 dark:text-zinc-200 ${className}`}
          style={{ display: 'none' }}
        >
          {getInitials(user?.name || 'U')}
        </div>
      </div>
    );
  }

  const initials = getInitials(user?.name || 'U');
  
  return (
    <div 
      className={`rounded-full ${sizeClass} border border-zinc-200 dark:border-zinc-600 flex items-center justify-center font-medium bg-zinc-200 text-zinc-700 dark:bg-zinc-600 dark:text-zinc-200 ${className}`}
    >
      {initials}
    </div>
  );
}
