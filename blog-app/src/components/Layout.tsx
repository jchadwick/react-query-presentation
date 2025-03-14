import { Link, Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            React Query Blog
          </Link>
        </h1>
        <nav className="flex gap-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            Home
          </Link>
          <Link to="/posts/new" className="text-blue-600 hover:text-blue-800">
            Add New Post
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="mt-12 pt-4 border-t border-gray-200 text-center text-gray-500">
        <p>React Query Blog Demo &copy; {new Date().getFullYear()}</p>
        <ClearCacheButton />
      </footer>
    </div>
  );
};

function ClearCacheButton() {
  const clearCache = () => {
    localStorage.clear();
    window.location.reload();
  };
  return (
    <a
      href="#"
      onClick={clearCache}
      className="text-blue-600 hover:text-blue-800"
    >
      Clear Cache
    </a>
  );
}

export default Layout;
