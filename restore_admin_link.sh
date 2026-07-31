#!/bin/bash
sed -i '/<h4 className="font-semibold text-foreground">Administration<\/h4>/a \              <ul className="space-y-2 text-sm text-muted-foreground">\n                <li><Link href="/admin" className="hover:text-primary transition-colors flex items-center gap-2"><HelpCircle className="w-4 h-4"/> Admin Portal</Link></li>\n              </ul>' src/components/MainLayout.tsx
