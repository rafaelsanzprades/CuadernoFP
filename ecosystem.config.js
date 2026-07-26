module.exports = {
  apps: [
    {
      name: "cuadernofp-backend",
      cwd: "./backend",
      script: ".venv313\\Scripts\\python.exe",
      args: "-m uvicorn main:app --reload --port 8000",
      interpreter: "none",
      watch: false,
      env: {
        NODE_ENV: "development",
      }
    },
    {
      name: "cuadernofp-frontend",
      cwd: "./frontend",
      script: "node_modules\\next\\dist\\bin\\next",
      args: "dev --turbo",
      watch: false,
      env: {
        NODE_ENV: "development",
        NODE_OPTIONS: "--max-old-space-size=4096"
      }
    }
  ]
};
