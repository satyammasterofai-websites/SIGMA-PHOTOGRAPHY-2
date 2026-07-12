const fs = require('fs');
let code = fs.readFileSync('src/pages/PremiumGallery.tsx', 'utf-8');

const search = `            <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 scrollbar-hide">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLanguage(lang)}
                  className={\`px-6 py-4 rounded-xl font-medium whitespace-nowrap transition-all \${activeLanguage === lang ? "bg-brand-rose text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}\`}
                >
                  {lang === "All" ? "All Languages" : lang}
                </button>
              ))}
            </div>
          </div>`;

const replace = `            <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 scrollbar-hide">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLanguage(lang)}
                  className={\`px-6 py-4 rounded-xl font-medium whitespace-nowrap transition-all \${activeLanguage === lang ? "bg-brand-rose text-white shadow-md" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}\`}
                >
                  {lang === "All" ? "All Languages" : lang}
                </button>
              ))}
            </div>
          </div>
          </div>`;

code = code.replace(search, replace);
fs.writeFileSync('src/pages/PremiumGallery.tsx', code);
console.log("Success fix gallery");
