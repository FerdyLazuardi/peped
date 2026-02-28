import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

/** 
 * Vite Plugin — converts PDFs in public/knowledge_base/ to .txt at startup,
 * then generates manifest.json listing all displayable text files.
 * Browser only ever fetches plain .txt → zero PDF overhead on client.
 */
async function convertPdfToTxt(pdfPath, txtPath) {
  try {
    // Dynamic import to avoid issues with Vite's own processing
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const data = new Uint8Array(fs.readFileSync(pdfPath))
    if (data.length === 0) {
      console.warn(`[KB] Skipping empty PDF: ${path.basename(pdfPath)}`)
      return false
    }
    const pdf = await pdfjs.getDocument({ data, verbosity: 0 }).promise
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const tc = await page.getTextContent()
      text += tc.items.map(it => it.str).join(' ') + '\n\n'
    }
    fs.writeFileSync(txtPath, text.trim())
    console.log(`[KB] Converted: ${path.basename(pdfPath)} → ${path.basename(txtPath)}`)
    return true
  } catch (err) {
    console.error(`[KB] Failed to convert ${path.basename(pdfPath)}:`, err.message)
    return false
  }
}

async function buildKnowledgeBase() {
  const kbDir = path.resolve('public/knowledge_base')
  if (!fs.existsSync(kbDir)) fs.mkdirSync(kbDir, { recursive: true })

  const allFiles = fs.readdirSync(kbDir)

  // Convert any PDF that doesn't have a corresponding .txt yet
  const pdfs = allFiles.filter(f => f.toLowerCase().endsWith('.pdf'))
  for (const pdf of pdfs) {
    const txtName = pdf.replace(/\.pdf$/i, '.txt')
    const txtPath = path.join(kbDir, txtName)
    if (!fs.existsSync(txtPath)) {
      await convertPdfToTxt(path.join(kbDir, pdf), txtPath)
    }
  }

  // Build manifest of .txt files only (exclude manifest.json itself)
  const txtFiles = fs.readdirSync(kbDir).filter(f => f.endsWith('.txt'))
  const manifest = path.join(kbDir, 'manifest.json')
  fs.writeFileSync(manifest, JSON.stringify(txtFiles, null, 2))
}

function knowledgeBasePlugin() {
  return {
    name: 'knowledge-base',
    async buildStart() { await buildKnowledgeBase() },
    async configureServer() { await buildKnowledgeBase() }
  }
}

export default defineConfig({
  plugins: [react(), knowledgeBasePlugin()],
})


