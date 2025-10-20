const dependencyMap: Record<string, string> = {
  'motion\.': 'https://unpkg.com/framer-motion@11.0.3/dist/framer-motion.umd.js',
  'lucide-react': 'https://unpkg.com/lucide-react@0.394.0/dist/lucide-react.umd.js',
  'Recharts': 'https://unpkg.com/recharts@2.12.7/umd/Recharts.min.js',
  'axios': 'https://unpkg.com/axios@1.7.7/dist/axios.min.js',
  'marked': 'https://unpkg.com/marked@13.0.2/marked.min.js',
}

export function detectDependencies(code: string): string[] {
  const deps = new Set<string>()
  for (const [pattern, url] of Object.entries(dependencyMap)) {
    const regex = new RegExp(pattern, 'i')
    if (regex.test(code)) {
      deps.add(url)
    }
  }
  return Array.from(deps)
}
