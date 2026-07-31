#!/bin/bash
sed -i '/<li><Link href="\/admin-login" className="hover:text-primary transition-colors flex items-center gap-2"><HelpCircle className="w-4 h-4"\/> Admin Portal<\/Link><\/li>/d' src/components/MainLayout.tsx
