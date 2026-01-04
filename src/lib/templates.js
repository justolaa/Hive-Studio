export const TEMPLATES = [
  {
    id: "cinephile",
    name: "Cinephile Review",
    description: "Side-by-side translation. Images are automatically centered.",
    config: {
      // This main class will tell our CSS to center images
      containerClass: "cinephile-mode", 
      
      // Bootstrap classes for columns
      dualWrapper: "text-justify",
      left: "pull-left",
      right: "pull-right",
    }
  },
  {
    id: "standard",
    name: "Standard Blog",
    description: "Simple layout. Images are left-aligned (default).",
    config: {
      containerClass: "standard-mode",
      
      // Standard grid for blog posts
      dualWrapper: "row",
      left: "col-6",
      right: "col-6",
    }
  }
];