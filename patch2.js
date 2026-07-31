const fs = require('fs');
let code = fs.readFileSync('src/components/MainLayout.tsx', 'utf8');

code = code.replace(
  /\{user.accountType === "admin" \? <Link href="\/admin" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"><Shield className="h-5 w-5" \/><\/Link> : <Link href="\/profile" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">\s*<User className="h-5 w-5" \/>\s*<\/Link>\}/g,
  `{user.accountType === "admin" ? (
                  <Link href="/admin" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                    <Shield className="h-5 w-5" />
                  </Link>
                ) : (
                  <Link href="/profile" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                    <User className="h-5 w-5" />
                  </Link>
                )}`
);

code = code.replace(
  /\{user.accountType === "admin" \? <Link href="\/admin" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"><Shield className="h-5 w-5" \/><\/Link> : <Link href="\/profile" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">\s*<User className="h-5 w-5" \/>\s*<\/Link>\s*<\/>/g,
  `{user.accountType === "admin" ? (
                  <Link href="/admin" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                    <Shield className="h-5 w-5" />
                  </Link>
                ) : (
                  <Link href="/profile" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
                    <User className="h-5 w-5" />
                  </Link>
                )}
              </>`
);
fs.writeFileSync('src/components/MainLayout.tsx', code);
