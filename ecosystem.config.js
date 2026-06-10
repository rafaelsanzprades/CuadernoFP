module.exports = {
  apps: [
    {
      name: "cuadernofp-backend",
      cwd: "c:\\GD-rsp\\APP\\backend",
      script: ".venv313\\Scripts\\python.exe",
      args: "-m uvicorn main:app --reload --port 8000",
      interpreter: "none",
      watch: false,
      env: {
        NODE_ENV: "production",
      }
    },
    {
      name: "cuadernofp-frontend",
      cwd: "c:\\GD-rsp\\APP\\frontend",
      script: "node_modules\\next\\dist\\bin\\next",
      args: "dev",
      watch: false,
      env: {
        NODE_ENV: "development",
      }
    }
  ]
};
