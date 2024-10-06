import { it, expect } from 'vitest'
import { downloadPackage, updatePlugin } from '../lib'
import { pathExists } from 'path-exists'
import { initTempPath } from '@liuli-util/test'
import path from 'path'

it('should download package', async () => {
  const r = await downloadPackage('@novachat/plugin-openai')
  expect(await pathExists(r)).true
})

const tempPath = await initTempPath(__filename)

it('should download plugin', async () => {
  const packageDir = await downloadPackage('@novachat/plugin-openai')
  const pluginDir = path.resolve(tempPath, 'plugin-openai')
  await updatePlugin(packageDir, pluginDir)
  expect(await pathExists(path.resolve(pluginDir, 'plugin.zip'))).true
})
