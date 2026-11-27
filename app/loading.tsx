import { OrbitalSpinner, DashboardSkeleton } from '../components/ui/PanelSkeletons';

export default function GlobalLoading() {
  return (
    <div className="relative min-h-[75vh]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-6 flex items-center justify-end">
        <OrbitalSpinner size="sm" label="Cargando módulo..." />
      </div>
      <DashboardSkeleton />
    </div>
  );
}
