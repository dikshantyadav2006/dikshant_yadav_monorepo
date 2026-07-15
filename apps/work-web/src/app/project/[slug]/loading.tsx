export default function ProjectLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="w-full h-[50vh] md:h-[70vh] bg-[#ddd]" />
      <div className="max-w-[900px] mx-auto px-1 py-[60px] md:py-[100px]">
        <div className="h-3 w-48 bg-[#ddd] mb-6" />
        <div className="h-12 md:h-16 w-3/4 bg-[#ddd] mb-8" />
        <div className="h-4 w-full bg-[#ddd] mb-3" />
        <div className="h-4 w-2/3 bg-[#ddd]" />
      </div>
    </div>
  );
}
