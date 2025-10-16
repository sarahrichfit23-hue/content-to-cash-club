export default function Upgrade() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-4">Upgrade Required</h1>
      <p className="max-w-md mb-6">
        The Meal Plan Generator is available to Pro and Premium coaches only.
      </p>
      <a
        href="https://your-website.com/upgrade"
        target="_blank"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Upgrade Now
      </a>
    </div>
  );
}

