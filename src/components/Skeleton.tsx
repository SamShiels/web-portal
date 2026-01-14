type SkeletonProps = {
  className?: string;
};

const Skeleton = ({ className }: SkeletonProps) => {
  return <span className={`skeleton ${className ?? ""}`.trim()} aria-hidden="true" />;
};

export default Skeleton;
