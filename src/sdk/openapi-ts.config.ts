import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: './document.json',
  output: 'api',
  plugins: ['@hey-api/client-angular'],
})
