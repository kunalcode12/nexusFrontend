const LoadingBar = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div
        className="h-full bg-red-500 animate-loading-bar"
        style={{
          width: "30%",
        }}
      />
    </div>
  );
};

export default LoadingBar;
