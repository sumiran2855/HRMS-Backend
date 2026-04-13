module.exports = {
  apps: [
    {
      name: "auth-service",
      cwd: "services/auth-service",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development"
      }
    },
    {
      name: "employee-service",
      cwd: "services/employee-service",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development"
      }
    },
    {
      name: "attendance-service",
      cwd: "services/attendance-service",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development"
      }
    }
  ]
};
