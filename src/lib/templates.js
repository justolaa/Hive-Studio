export const TEMPLATES = [
  {
    id: "cinephile",
    name: "Cinephile Review",
    config: {
      containerClass: "cinephile-mode", 
      dualWrapper: "text-justify",
      left: "pull-left",
      right: "pull-right",
    },
    // NEW: The Starter Text
    skeleton: `# Movie Title (2024)

<center><img src="https://kgtwiouewpybiboywane.supabase.co/storage/v1/object/public/hive-assets/dividers/HivePUD2_Divider.jpg" /></center>

[dual]
<strong>Introduction</strong> <br/>
A quick summary of the movie without spoilers.
---
<strong>Introducción</strong> <br/>
Un resumen rápido de la película sin spoilers.
[/dual]

<h2>The Plot / La Trama</h2>

[dual]
Here discuss the plot...
---
Aquí discute la trama...
[/dual]

<h2>Conclusion</h2>

[dual]
<strong>Rating: ⭐⭐⭐⭐☆</strong> <br/>
Final thoughts...
---
<strong>Calificación: ⭐⭐⭐⭐☆</strong> <br/>
Pensamientos finales...
[/dual]`
  },
  {
    id: "standard",
    name: "Standard Blog",
    config: {
      containerClass: "standard-mode",
      dualWrapper: "row",
      left: "col-6",
      right: "col-6",
    },
    skeleton: `# My Daily Blog

<center><img src="https://images.hive.blog/..." /></center>

[dual]
Today was an interesting day...
---
Hoy fue un día interesante...
[/dual]

<center><img src="https://kgtwiouewpybiboywane.supabase.co/storage/v1/object/public/hive-assets/dividers/HivePUD2_Divider.jpg" /></center>

[dual]
**What I learned:**
...
---
**Lo que aprendí:**
...
[/dual]`
  }
];