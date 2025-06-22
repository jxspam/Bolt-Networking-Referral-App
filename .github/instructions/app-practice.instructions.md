---
applyTo: "**"
---

1. **Add a section for running commands**: If your project requires specific commands to run, such as starting a server, building the project, or running tests, include these in the documentation. This helps users quickly understand how to get started.
2. **Use package.json or requirements.txt**: If your project is a Node.js application, use the `package.json` file to define scripts that can be run with `npm run <script-name>`. For Python projects, use `requirements.txt` to list dependencies and provide instructions for setting up the environment.
   Make sure whatever project you are working on, if you have any suggested running commands, consider applying it to the package.json, or requirements.txt, and so on
   so that it is easy for the user to run the project.
   For example, if you have a command to install dependencies, add it to the `scripts` section of `package.json`:

```json
{
  "scripts": {
    "install-deps": "npm install"
  }
}
```

3. **Include environment variable setup**: If your project requires environment variables, provide clear instructions on how to set them up. This can include creating a `.env` file or exporting variables in the terminal.
4. **Document the database setup**: If your project uses a database, include instructions for setting it up, such as running migrations or seeding data. This ensures users can get the application running with the necessary data.
5. **Always find the tools you have especially Supabase MCP**: Use the referrl-app project supabase MCP to make sure the backend is fully connected with the backend and the frontend is fully connected with the backend.
