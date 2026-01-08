const GlobalLoader = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-200 text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default GlobalLoader;
