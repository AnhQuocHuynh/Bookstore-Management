const LoginPage = () => {
  return (
    <form className="bg-white p-8 shadow rounded w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <input
        type="text"
        placeholder="Username"
        className="w-full p-2 mb-4 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 mb-4 border rounded"
      />
      <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Login
      </button>
    </form>
  );
};

export default LoginPage;
