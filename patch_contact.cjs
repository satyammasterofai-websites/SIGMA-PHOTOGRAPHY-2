const fs = require('fs');
let code = fs.readFileSync('src/components/ContactAndTestimonials.tsx', 'utf-8');

// Replace imports
code = code.replace(
  "import { MessageCircle, MapPin, Phone, Mail, Instagram, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';",
  "import { MessageCircle, MapPin, Phone, Mail, Instagram, ArrowRight } from 'lucide-react';\nimport TestimonialsCarousel from './TestimonialsCarousel';"
);

// We need to replace the entire section.
const sectionStart = `<section className="py-24 border-y border-brand-purple/10 relative overflow-hidden">`;
const sectionEnd = `      {/* Lightbox Modal */}`;
const indexOfStart = code.indexOf(sectionStart);
const indexOfEnd = code.indexOf(sectionEnd);

if (indexOfStart !== -1 && indexOfEnd !== -1) {
  // also find Lightbox Modal end
  const nextSectionIndex = code.indexOf(`      <CustomServicesSection />`);
  const beforeSection = code.substring(0, indexOfStart);
  const afterSection = code.substring(nextSectionIndex);
  
  const newSection = `      <section className="py-24 border-y border-brand-purple/10 relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-purple/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-electric/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 w-full">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
              Client <span className="text-gradient-primary">Triumphs</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Hear what our amazing couples have to say about their cinematic invitations.
            </p>
          </div>
          
          <TestimonialsCarousel testimonials={displayTestimonials} />
        </div>
      </section>

`;
  
  code = beforeSection + newSection + afterSection;
}

// remove unused state variables
code = code.replace("const [selectedImage, setSelectedImage] = useState<string | null>(null);\n", "");
code = code.replace("const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);\n", "");

// remove useEffect and navigation methods
const useEffectRegex = /  useEffect\(\(\) => \{[\s\S]*?\}, \[displayTestimonials\.length\]\);\n\n  const nextTestimonial = [\s\S]*?;\n  const prevTestimonial = [\s\S]*?;\n/;
code = code.replace(useEffectRegex, "");

fs.writeFileSync('src/components/ContactAndTestimonials.tsx', code);
console.log("Patched ContactAndTestimonials");
