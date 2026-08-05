import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.static('dist'))

// Build a parsed list once
const distDir = path.join(__dirname, 'dist')
const indexPath = path.join(distDir, 'index.html')

const serveIndex = (_req, res) => res.sendFile(indexPath)

// Fallback SPA routing: every request that is not an existing file/asset returns index.html
app.get(/^\/(?!assets|api).*/, serveIndex)

// Any other unmatched non-GET or stray routes also fall back safely to the app shell
app.use(serveIndex)

app.listen(PORT, () => console.log(`Serving AgriTrace frontend on ${PORT}`))