import { ArrowDownAZ, ArrowDownUp, Clock, HardDrive } from 'lucide-react';

const SortDropdown = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-zinc-500 hidden sm:inline-block">Sort by</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white border border-zinc-200 rounded-lg px-3 py-1.5 pr-8 text-sm text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
        >
          <option value="name">Name</option>
          <option value="size">Size</option>
          <option value="date">Date Modified</option>
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
          <ArrowDownUp className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

export default SortDropdown;
