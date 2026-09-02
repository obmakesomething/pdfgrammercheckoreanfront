import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const targetPath = process.argv[2] ?? 'app/layout.tsx'
const source = await readFile(targetPath, 'utf8')

const metadataStart = source.indexOf('export const metadata: Metadata = {')
const layoutStart = source.indexOf('export default function RootLayout')

if (metadataStart < 0 || layoutStart <= metadataStart) {
  console.error(JSON.stringify({
    schema: 'migration-metadata-verification-v1',
    status: 'NOT_EVALUATED',
    targetPath,
    reason: 'METADATA_BLOCK_NOT_FOUND',
  }))
  process.exit(2)
}

const metadata = source.slice(metadataStart, layoutStart)
const checks = [
  {
    id: 'shutdown-disclosed',
    pass: metadata.includes('웹 서비스는 종료되었습니다'),
  },
  {
    id: 'toss-destination-disclosed',
    pass:
      metadata.includes('Apps in Toss') &&
      metadata.includes('pdfgrammercheckorean'),
  },
  {
    id: 'legacy-free-online-title-removed',
    pass: !metadata.includes('무료 온라인 PDF 맞춤법 교정'),
  },
  {
    id: 'legacy-active-service-description-removed',
    pass:
      !metadata.includes('무료로 검사하고 교정합니다') &&
      !metadata.includes('업로드한 PDF에 맞춤법 오류'),
  },
]

const failed = checks.filter(({ pass }) => !pass)
const report = {
  schema: 'migration-metadata-verification-v1',
  status: failed.length === 0 ? 'PASS' : 'FAIL',
  targetPath,
  sourceSha256: `sha256:${createHash('sha256').update(source).digest('hex')}`,
  checks,
}

console.log(JSON.stringify(report, null, 2))

if (failed.length > 0) {
  process.exitCode = 1
}
