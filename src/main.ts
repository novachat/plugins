import search from 'libnpmsearch'
import path from 'path'
import { downloadPackage, pluginManifests, updatePlugin } from './lib'
import { pathExists } from 'path-exists'
import { readFile } from 'fs/promises'
import { $ } from 'zx'

const plugins = await search('novachat-plugin')

async function commitAndPush(message: string) {
  await $`git add . && git commit -m "${message}" && git push`
}

async function handlePlugin(it: search.Result) {
  if (
    !it.name.startsWith('@novachat/plugin-') &&
    !it.name.startsWith('novachat-plugin-')
  ) {
    console.log(`${it.name} is not a valid plugin`)
    return
  }
  const packageDir = await downloadPackage(it.name)
  if (
    !(await pathExists(packageDir)) ||
    !pathExists(path.resolve(packageDir, 'publish/plugin.zip')) ||
    !pathExists(path.resolve(packageDir, 'publish/plugin.json'))
  ) {
    console.log(`${it.name} is not a valid plugin`)
    return
  }
  const manifest = JSON.parse(
    await readFile(path.resolve(packageDir, 'publish/plugin.json'), 'utf8'),
  ) as { id: string; version: string }
  const pluginDir = path.resolve(__dirname, `../plugins/${manifest.id}`)
  if (pluginManifests[manifest.id]) {
    if (pluginManifests[manifest.id].version === manifest.version) {
      console.log(`${manifest.id} is up to date ${manifest.version}`)
      return
    }
    console.log(`${manifest.id} has a new version ${manifest.version}`)
    await updatePlugin(packageDir, pluginDir)
    await commitAndPush(`Update ${manifest.id} to version ${manifest.version}`)
  } else {
    console.log(`${manifest.id} is a new plugin`)
    await updatePlugin(packageDir, pluginDir)
    await commitAndPush(`Add new plugin: ${manifest.id}@${manifest.version}`)
  }
}

for (const it of plugins) {
  await handlePlugin(it)
}
