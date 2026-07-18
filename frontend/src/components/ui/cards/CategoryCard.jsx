import * as Icons from 'lucide-react';

export const CategoryCard = ({ name, iconName, colorClass = 'text-blue-500', bgClass = 'bg-blue-50', onClick }) => {
  // Dynamically resolve the icon from lucide-react, fallback to Landmark if not found
  const Icon = Icons[iconName] || Icons.Landmark;

  return (
    <div 
      onClick={onClick}
      className="group bg-white flex flex-col items-center justify-center p-8 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-lg hover:border-primary-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full"
    >
      <div className={`w-16 h-16 rounded-full ${bgClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-8 h-8 ${colorClass}`} />
      </div>
      <h3 className="font-semibold text-slate-800 text-center">{name}</h3>
    </div>
  );
};
