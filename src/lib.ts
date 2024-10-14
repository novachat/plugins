import pacote from 'pacote'
import fs from 'fs/promises'
import findCacheDir from 'find-cache-dir'
import path from 'path'
import { cp, mkdir, readFile } from 'fs/promises'
import pluginManifests from '../plugins.json'
import { pathExists } from 'path-exists'

const pluginsPath = path.join(__dirname, '../plugins.json')

export async function downloadPackage(packageName: string) {
  const cacheDir = findCacheDir({ name: packageName })
  if (!cacheDir) {
    throw new Error('cacheDir not found')
  }
  await fs.mkdir(cacheDir, { recursive: true })
  await pacote.extract(packageName, cacheDir)
  return cacheDir
}

export async function updatePlugin(packageDir: string, pluginDir: string) {
  await mkdir(pluginDir, { recursive: true })
  const manifest = JSON.parse(
    await readFile(path.resolve(packageDir, 'publish/plugin.json'), 'utf8'),
  )
  await cp(
    path.resolve(packageDir, 'publish/plugin.zip'),
    path.resolve(pluginDir, 'plugin.zip'),
  )
  await cp(
    path.resolve(packageDir, 'publish/plugin.json'),
    path.resolve(pluginDir, 'plugin.json'),
  )
  if (await pathExists(path.resolve(packageDir, 'README.md'))) {
    await cp(
      path.resolve(packageDir, 'README.md'),
      path.resolve(pluginDir, 'README.md'),
    )
  }
  pluginManifests[manifest.id] = manifest
  await fs.writeFile(pluginsPath, JSON.stringify(pluginManifests, null, 2))
}
