module.exports = {
  apps: [

    {
      name: "milkman-backend",
      script: "cmd",
      args: "/c C:\\Users\\Rovin\\OneDrive\\Desktop\\MCA\\BizmetricPython\\milkproject\\env\\Scripts\\python.exe manage.py runserver 0.0.0.0:8000",
      cwd: "./milkman"
    },

    {
      name: "milkman-user",
      script: "cmd",
      args: "/c npm run dev",
      cwd: "./milkman-frontend"
    },

    {
      name: "milkman-admin",
      script: "cmd",
      args: "/c npm run dev",
      cwd: "./reactadmin"
    }

  ]
};