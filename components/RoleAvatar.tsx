'use client';

interface RoleAvatarProps {
  role: string;
  name?: string;
  size?: number;
  className?: string;
}

export default function RoleAvatar({
  role,
  name,
  size = 42,
  className = '',
}: RoleAvatarProps) {
  const isTutor = role === 'tutor' || role === 'docente';
  const src = isTutor ? '/avatars/tutor-avatar.jpg' : '/avatars/student-avatar.jpg';
  const roleLabel = isTutor ? 'Tutor' : 'Estudiante';
  const alt = name ? `Foto de perfil de ${name} (${roleLabel})` : `Foto de perfil de ${roleLabel}`;

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 border-2 shadow-sm ${
        isTutor
          ? 'border-[#67E8F9]/60 shadow-[0_0_14px_rgba(103,232,249,0.22)]'
          : 'border-[#6EE7B7]/60 shadow-[0_0_14px_rgba(110,231,183,0.22)]'
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover object-top block"
      />
    </div>
  );
}
