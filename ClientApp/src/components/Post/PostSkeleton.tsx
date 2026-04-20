const PostSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-full mx-auto mb-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="rounded-full bg-gray-300 h-10 w-10"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-300 rounded w-1/4"></div>
          <div className="h-2 bg-gray-200 rounded w-1/6"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-300 rounded w-full"></div>
        <div className="h-3 bg-gray-300 rounded w-5/6"></div>
      </div>

      {/* Media Skeleton */}
      <div className="rounded-lg bg-gray-300 aspect-video w-full mb-4"></div>

      {/* Actions Skeleton */}
      <div className="flex justify-between pt-2 border-t border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );
};

export default PostSkeleton;