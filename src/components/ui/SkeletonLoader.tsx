import React from "react";

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = "",
  count = 1,
}) => {
  const skeletons = Array(count).fill(null);

  return (
    <>
      {skeletons.map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 rounded-lg ${className}`}
        >
          <div className="h-48 bg-gray-300 rounded-t-lg"></div>
          <div className="p-4">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-10 bg-gray-300 rounded w-10"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;
