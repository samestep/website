import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: [
        resolve(__dirname, "index.html"),
        resolve(__dirname, "blog/2021/02/20/parallelizing-nvcc/index.html"),
      ],
    },
  },
});
