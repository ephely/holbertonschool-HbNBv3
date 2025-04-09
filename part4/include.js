// Fonction pour charger un fichier HTML et l'injecter dans un élément
function includeHTML(id, file) {
    fetch(file)
      .then(res => res.text())
      .then(html => {
        document.getElementById(id).innerHTML = html;
      });
  }
  
  // Inclure header et footer
  includeHTML("header", "header.html");
  includeHTML("footer", "footer.html");