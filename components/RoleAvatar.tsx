'use client';

interface RoleAvatarProps {
  role: string;
  name?: string;
  size?: number;
  className?: string;
}

function TutorBadge2D() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full block" aria-hidden="true">
      <defs>
        <linearGradient id="tutorBg2d" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0C4A6E" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" fill="url(#tutorBg2d)" />
      {/* Anillo sutil 2D */}
      <circle cx="32" cy="32" r="25" stroke="#67E8F9" strokeOpacity="0.22" strokeWidth="1.5" />
      {/* Birrete académico minimalista 2D unisex */}
      <polygon
        points="32,16 50,25 32,34 14,25"
        fill="#67E8F9"
      />
      <path
        d="M21 29.5V39.5C21 43 26 46 32 46C38 46 43 43 43 39.5V29.5L32 35L21 29.5Z"
        fill="#BAE6FD"
        fillOpacity="0.92"
      />
      {/* Borla lateral */}
      <path
        d="M47 27V37"
        stroke="#FDE68A"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="47" cy="39" r="2.6" fill="#FDE68A" />
      {/* Destello guía */}
      <path
        d="M17 16L18.2 19L21.2 20.2L18.2 21.4L17 24.4L15.8 21.4L12.8 20.2L15.8 19L17 16Z"
        fill="#E0F2FE"
      />
    </svg>
  );
}

function StudentBadge2D() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full block" aria-hidden="true">
      <defs>
        <linearGradient id="studentBg2d" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#065F46" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" fill="url(#studentBg2d)" />
      {/* Anillo sutil 2D */}
      <circle cx="32" cy="32" r="25" stroke="#6EE7B7" strokeOpacity="0.22" strokeWidth="1.5" />
      {/* Casco de explorador espacial 2D unisex */}
      <circle cx="32" cy="30" r="14" fill="#A7F3D0" />
      <rect x="22" y="23.5" width="20" height="12.5" rx="6.25" fill="#0F172A" />
      {/* Reflejo plano 2D del visor */}
      <path
        d="M26 27.5C27.5 26.2 30.2 25.8 33 26.2"
        stroke="#6EE7B7"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Cuello y hombros neutros 2D */}
      <path
        d="M17 51C18.5 44 24.2 41 32 41C39.8 41 45.5 44 47 51H17Z"
        fill="#6EE7B7"
      />
      {/* Insignia estrella en el pecho */}
      <circle cx="32" cy="46.5" r="2.2" fill="#064E3B" />
      {/* Estrellita orbital */}
      <circle cx="48" cy="18" r="2.2" fill="#FDE68A" />
    </svg>
  );
}

export default function RoleAvatar({
  role,
  name,
  size = 42,
  className = '',
}: RoleAvatarProps) {
  const isTutor = role === 'tutor' || role === 'docente';
  const roleLabel = isTutor ? 'Tutor' : 'Estudiante';
  const label = name ? `Avatar de ${name} (${roleLabel})` : `Avatar de ${roleLabel}`;

  return (
    <div
      role="img"
      aria-label={label}
      data-keep-light-text="true"
      className={`relative rounded-full overflow-hidden shrink-0 border-2 shadow-sm ${
        isTutor
          ? 'border-[#67E8F9]/60 shadow-[0_0_14px_rgba(103,232,249,0.22)]'
          : 'border-[#6EE7B7]/60 shadow-[0_0_14px_rgba(110,231,183,0.22)]'
      } ${className}`}
      style={{ width: size, height: size }}
    >
      {isTutor ? <TutorBadge2D /> : <StudentBadge2D />}
    </div>
  );
}
